# app.py
from flask import Flask, request, jsonify, session, render_template
from flask_session import Session
import os
from langchain_groq import ChatGroq
from agent import collect_logs, detect_anomaly, AgentState
from flask_cors import CORS
import traceback
import time
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "supersecretkey")
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
CORS(app)

# Initialize LLM
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0.2,
    api_key=os.getenv("GROQ_API_KEY"),
)

# ---------- Initialize agent state ----------
def get_agent_state():
    if "state" not in session:
        state: AgentState = {"logs": "", "anomaly_report": {}, "analysis": "", "conversation_history": []}
        state = collect_logs(state)
        state = detect_anomaly(state)
        session["state"] = state
    return session["state"]

def save_agent_state(state):
    session["state"] = state

# ---------- Routes ----------
@app.route("/")
def index():
    return render_template("chat.html")  # simple HTML + JS frontend

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "")
    state = get_agent_state()

    # Append user message
    state["conversation_history"].append({"role": "user", "content": user_input})

    # Build prompt with system + previous conversation
    full_prompt = [
        {"role": "system", "content": "You are an AI Security & System Health Assistant. Use the provided logs and anomaly report to assist the user."},
        {"role": "assistant", "content": f"Latest anomaly report:\n{state['anomaly_report']}"}
    ]
    print(state['anomaly_report'])
    full_prompt.extend(state["conversation_history"])

    # Call LLM
    response = llm.invoke(full_prompt)
    assistant_message = response.content

    # Store assistant response
    state["conversation_history"].append({"role": "assistant", "content": assistant_message})
    save_agent_state(state)

    existing_count = 0
    msg = assistant_message.lower() 
    if "medium" in msg or "high" in msg or "critical" in msg:
        from jira_server import create_issue, get_total_issues
        issue_title = "Anamoly Detected - Action Required"
        issue_description = f"{state['anomaly_report']}\n\nUser Query:\n{user_input}\n\nAssistant Response:\n{msg}"
        existing_count = get_total_issues("project = OPS")
        create_issue(title=issue_title, description=issue_description)
        print("Jira issue created due to critical anomaly.")

    return jsonify(
        {
            "reply": assistant_message,
            "count":  existing_count
        }
    )


@app.route("/action", methods=["POST"])
def agent_action():
    try:
        data = request.get_json(force=True)
        user_input = data.get("query", "")
        if not user_input:
            return jsonify({"error": "Missing 'query' field in JSON body"}), 400

        state = data.get("state", {})
        if "conversation_history" not in state:
            state["conversation_history"] = []

        state["conversation_history"].append({"role": "user", "content": user_input})
        state["user_request"] = user_input

        print(f"\n🛠️ Creating dynamic tool for: {user_input}")

        last_error = ""
        last_code = ""
        success = False
        attempt = 0
        thinking_trace = []  # 🧠 store all intermediate attempts

        while not success:
            attempt += 1
            try:
                # Build LLM prompt dynamically
                code_prompt = f"""
You are an expert Python programmer. Write a single self-contained Python function named `dynamic_tool(state)`.

This function should parse the request from `state['user_request']` and execute the appropriate action.

Current user request: "{user_input}"

Previous attempt error (if any): "{last_error}"

Previous code attempt (if any): 
{last_code}

Requirements:
- Must return state with output in `state['dynamic_tool_output']`.
- Imports (`psutil`, `win32evtlog`, `datetime`, `re`) must be inside the function.
- Only return Python code for the function definition. No markdown, comments, or explanations.
"""
                response = llm.invoke(code_prompt)
                code_str = response.content.strip()

                # Cleanup output
                if code_str.startswith("```"):
                    code_str = "\n".join(code_str.split("\n")[1:-1])
                if (code_str.startswith('"') and code_str.endswith('"')) or \
                   (code_str.startswith("'") and code_str.endswith("'")):
                    code_str = code_str[1:-1]

                last_code = code_str

                # Execute generated code
                local_env = {}
                exec_globals = {"__builtins__": __builtins__}
                exec(code_str, exec_globals, local_env)

                if "dynamic_tool" not in local_env:
                    last_error = "LLM did not return a dynamic_tool function."
                    thinking_trace.append({
                        "attempt": attempt,
                        "code": last_code,
                        "error": last_error
                    })
                    print(f"⚠️ Attempt {attempt} failed: {last_error}")
                    continue

                try:
                    state = local_env["dynamic_tool"](state)
                    success = True
                    print(f"✅ Dynamic tool executed successfully on attempt {attempt}")
                    thinking_trace.append({
                        "attempt": attempt,
                        "code": last_code,
                        "error": None  # success
                    })
                except Exception as exec_error:
                    last_error = str(exec_error) + "\n" + traceback.format_exc()
                    thinking_trace.append({
                        "attempt": attempt,
                        "code": last_code,
                        "error": last_error
                    })
                    print(f"⚠️ Attempt {attempt} execution failed:\n{last_error}")
                    time.sleep(1)

            except Exception as e:
                last_error = str(e) + "\n" + traceback.format_exc()
                thinking_trace.append({
                    "attempt": attempt,
                    "code": last_code,
                    "error": last_error
                })
                print(f"⚠️ Attempt {attempt} LLM invocation failed:\n{last_error}")
                time.sleep(1)

        # Store assistant output in conversation
        state["conversation_history"].append({
            "role": "assistant",
            "content": str(state.get("dynamic_tool_output", "No output generated"))
        })

        # ✅ Return structured data including all attempts
        return jsonify({
            "status": "success",
            "attempts": attempt,
            "thinking_trace": thinking_trace,   # 🧠 All intermediate attempts
            "final_code": last_code,             # ✅ The working code
            "output": state.get("dynamic_tool_output", "No output generated"),
            "state": state
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500


if __name__ == "__main__":
    app.run(debug=True)