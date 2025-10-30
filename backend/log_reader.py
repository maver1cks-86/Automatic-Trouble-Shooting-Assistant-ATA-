import win32evtlog
import os

def read_windows_logs(server='localhost', log_type='System'):
    hand = win32evtlog.OpenEventLog(server, log_type)
    flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
    events = win32evtlog.ReadEventLog(hand, flags, 0)

    logs = []
    for event in events:
        if event.EventType in [1, 2]: # 1=Error, 2=Warning
            logs.append(f"EventID={event.EventID} Source={event.SourceName} Msg={event.StringInserts}")

    return "\n".join(logs[:30])  # keep top 30 events for now


def read_logs(server='localhost', log_type='Security',limit=100):
    hand = win32evtlog.OpenEventLog(server, log_type)
    flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ

    logs = []
    total = 0

    while True:
        events = win32evtlog.ReadEventLog(hand, flags, 0)
        if not events:  # no more events
            break

        for event in events:  # Error or Warning
            logs.append(f"EventID={event.EventID} Source={event.SourceName} Msg={event.StringInserts} Time={event.TimeGenerated}")
            total += 1
            if total >= limit:
                break
        if total >= limit:
            break

    win32evtlog.CloseEventLog(hand)
    print("Total logs read:", len(logs))
    return logs

read_logs()
