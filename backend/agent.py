
import os
import subprocess
from dotenv import load_dotenv
from typing import TypedDict
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

from log_reader import read_windows_logs, read_logs
from iso_model import  detect_log_anomalies  # <— this will be your isolation forest module
from datetime import datetime
from typing import List, Dict
load_dotenv()

# ---------- STATE ----------
class AgentState(TypedDict):
    logs: str
    anomaly_report: dict
    analysis: str
    conversation_history: List[Dict[str, str]]

# ---------- NODE 1: COLLECT LOGS ----------
def collect_logs(state: AgentState,log_type="System"):
    state["logs"] = read_windows_logs(log_type=log_type)
   # print("logs lol",state["logs"])
    return state

# ---------- NODE 2: ISOLATION FOREST ANOMALY DETECTOR ----------
from datetime import datetime
from iso_model import detect_log_anomalies

def detect_anomaly(state: AgentState):
    try:
        raw_logs = read_logs()  # returns list of strings
    except Exception:
        raw_logs = read_logs(log_type="System")

    parsed_entries = []
    for line in raw_logs:
        if not line.strip():
            continue
        # split by space, then by '='
        parts = dict([tuple(p.split("=", 1)) for p in line.split(" ") if "=" in p])
        parsed_entries.append({
            "EventID": int(parts.get("EventID", 0)),
            "Source": parts.get("Source", "Unknown"),
            "Msg": parts.get("Msg", ""),
            "Time": parts.get("Time", datetime.now().isoformat())
        })

    if not parsed_entries:
        state["anomaly_report"] = "No logs available to analyze"
        return state

    # Isolation Forest
    df, model = detect_log_anomalies(parsed_entries)

    anomalies = df[df["anomaly"] == -1]

    state["anomaly_report"] = {
        "total_logs": len(df),
        "anomalies_found": len(anomalies),
        "anomaly_events": anomalies.to_dict(orient="records")
    }

    return state

def safe_service_restart(state: AgentState):
    """
    Perform a safe demo action after log analysis.
    For demonstration, we restart the WLAN service (WlanSvc) to simulate remediation.
    """
    service_name = "WlanSvc"
    try:
        print(f"Restarting service {service_name} for demo purposes...")
        # PowerShell command to restart service
        subprocess.run(["powershell", "-Command", f"Restart-Service -Name {service_name} -Force"], check=True)
        print(f"{service_name} restarted successfully.")
        state["analysis"] += f"\n\nDEMO REMEDIATION: Service {service_name} was restarted as a safe recovery action."
    except Exception as e:
        print(f"Failed to restart service {service_name}: {e}")
        state["analysis"] += f"\n\nDEMO REMEDIATION FAILED: Could not restart {service_name}."
    return state

# ---------- NODE 3: LLM ANALYSIS ----------
# ---------- NODE 3: LLM ANALYSIS ----------
def analyze_logs(state: AgentState):
    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.2,
        api_key=os.getenv("GROQ_API_KEY"),
    )

    prompt = f"""
You are an AI-driven Security & System Health Analyst.

--- SYSTEM LOGS ---
{state['logs']}

Task 1: Analyze the system logs **separately**. Provide a concise summary of notable events, potential root causes, and recommended remediation. Output this under the heading:

SYSTEM LOGS ANALYSIS:
<Your summary here, 3-5 sentences>

--- ANOMALY DETECTION / SECURITY LOGS ---
{state['anomaly_report']}

Task 2: Analyze the anomalies. Identify the most critical anomaly and provide analysis **exactly in this structured format** :

ANOMALY REPORT ANALYSIS:
SEVERITY: <LOW|MEDIUM|HIGH>
SUMMARY: <2-4 sentence explanation including what the anomaly is, why it was flagged, root cause, and impact>
TICKET_REQUIRED: <YES|NO>
ESCALATION: <None | Security | System | Network>

Rules:
- Task 1 and Task 2 must be **separate sections**.
- Task 1 (system logs analysis) is free-text but concise.
- Task 2 (anomaly analysis) must strictly follow the structured format.
- Do not merge system logs into the structured anomaly report.
- Do not add extra text outside these two sections.
- For every answer , mention : Severity level=<LOW|MEDIUM|HIGH> based on the criticality of the anomaly.
"""

    response = llm.invoke(prompt)
    state["analysis"] = response.content
    return state


def start_chat(state: AgentState):
    import os
    from langchain_groq import ChatGroq

    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.2,
        api_key=os.getenv("GROQ_API_KEY"),
    )

    if "conversation_history" not in state:
        state["conversation_history"] = []

    print("Chatbot initiated! Type 'exit' to quit.\n")

    while True:
        user_input = input("USER: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Exiting chat...")
            break

        # Add user input to history
        state["conversation_history"].append({"role": "user", "content": user_input})

        # Build prompt with system context + conversation history
        full_prompt = [
            {"role": "system", "content": "You are an AI Security & System Health Assistant."},
            {"role": "assistant", "content": f"Latest anomaly report:\n{state['anomaly_report']}"},
        ]

        # Add previous conversation
        for msg in state["conversation_history"]:
            full_prompt.append(msg)

        # Call LLM
        response = llm.invoke(full_prompt)

        # Store assistant response
        state["conversation_history"].append({"role": "assistant", "content": response.content})
        print(f"ASSISTANT: {response.content}\n")

TOOLS = {
    "collect_logs": collect_logs,
    "detect_anomaly": detect_anomaly,
    "safe_service_restart": safe_service_restart,
}

def start_agent_chat(state):
    import os
    from langchain_groq import ChatGroq
    import traceback
    import time

    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.2,
        api_key=os.getenv("GROQ_API_KEY"),
    )

    if "conversation_history" not in state:
        state["conversation_history"] = []

    print("🤖 Dynamic Agentic Chatbot initiated! Type 'exit' to quit.\n")

    while True:
        user_input = input("USER: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Exiting chat...")
            break

        state["conversation_history"].append({"role": "user", "content": user_input})
        state["user_request"] = user_input

        print(f"\n🛠️ Creating dynamic tool for: {user_input}")

        last_error = ""
        last_code = ""
        success = False
        attempt = 0
        # --- INFINITE FEEDBACK LOOP UNTIL WORKING CODE IS GENERATED ---
        while not success:
            if(attempt==10):
                break
            attempt += 1
            try:
                # Build prompt including last error and last code for self-correction
                code_prompt = f"""
You are an expert Python programmer. Write a single self-contained Python function named `dynamic_tool(state)`.

This function should parse the request from `state['user_request']` and execute the appropriate action.

Current user request: "{user_input}"

Previous attempt error (if any): "{last_error}"

Previous code attempt (if any): 
{last_code}

Requirements:
- Must return state with output in `state['dynamic_tool_output']` and also the string for readable format. Ensure its completely readable.
- Imports (`psutil`, `win32evtlog`, `datetime`, `re`) must be inside the function.
- Only return Python code for the function definition. No markdown, comments, or explanations.
- Make sure that the output of the function is stringified.
"""
                response = llm.invoke(code_prompt)
                code_str = response.content.strip()

                # Clean markdown or quotes
                if code_str.startswith("```"):
                    code_str = "\n".join(code_str.split("\n")[1:-1])
                if (code_str.startswith('"') and code_str.endswith('"')) or \
                   (code_str.startswith("'") and code_str.endswith("'")):
                    code_str = code_str[1:-1]

                last_code = code_str  # store last attempt code for feedback

                local_env = {}
                exec_globals = {"__builtins__": __builtins__}
                exec(code_str, exec_globals, local_env)

                if "dynamic_tool" not in local_env:
                    last_error = "LLM did not return a dynamic_tool function."
                    print(f"⚠️ Attempt {attempt} failed: {last_error}")
                    time.sleep(1)
                    continue

                try:
                    # Attempt to run the generated tool
                    state = local_env["dynamic_tool"](state)
                    success = True
                    print(f"✅ Dynamic tool executed successfully on attempt {attempt}")
                    print("OUTPUT:\n", state.get("dynamic_tool_output"))
                except Exception as exec_error:
                    last_error = str(exec_error) + "\n" + traceback.format_exc()
                    print(f"⚠️ Attempt {attempt} execution failed:\n{last_error}")
                    time.sleep(1)

            except Exception as e:
                last_error = str(e) + "\n" + traceback.format_exc()
                print(f"⚠️ Attempt {attempt} LLM invocation failed:\n{last_error}")
                time.sleep(1)
            

        # Store successful output in conversation history
        state["conversation_history"].append({
            "role": "assistant",
            "content": str(state.get("dynamic_tool_output", "No output generated"))
        })




# ---------- BUILD GRAPH ----------
graph = StateGraph(AgentState)
graph.add_node("collect_logs", collect_logs)
graph.add_node("detect_anomaly", detect_anomaly)
graph.add_node("analyze_logs", analyze_logs)
graph.add_node("safe_service_restart", safe_service_restart)  # NEW NODE

# Define flow
graph.add_edge("collect_logs", "detect_anomaly")
graph.add_edge("detect_anomaly", "analyze_logs")
graph.add_edge("analyze_logs", "safe_service_restart")  # run remediation after analysis

graph.set_entry_point("collect_logs")
graph.set_finish_point("safe_service_restart")  # finish after remediation


agent = graph.compile()

# ---------- RUN ----------
if __name__ == "__main__":
    result = agent.invoke({"logs": "", "anomaly_report": {}, "analysis": ""})
    state = {"logs": "", "anomaly_report": {}, "analysis": "", "conversation_history": []}
    state = collect_logs(state)
    state = detect_anomaly(state)

    # Start interactive chatbot
    start_agent_chat(state)
