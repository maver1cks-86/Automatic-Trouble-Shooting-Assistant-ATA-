from jira import JIRA

jira_server = "https://rifaqatnawaz25.atlassian.net"
jira_email = "rifaqatnawaz25@gmail.com"
jira_api_token = "ATATT3xFfGF0V-lu9qOjwjj0DkkRtPUOhB4VDceU0l78gXb-K2hO_1PU8zQrQhrlJgXgvNiPp5kyUntr4PvVd4mrYHKdltStjwLi_Vx2KfTHCspLWD3o988K4zHeJLCmHOmKfkZbCvNOxYBVA76V_XLf8PawjR25rBulM5ox8jBd5-YnnY2oIK8=6C1F455B"

jira = JIRA(server=jira_server, basic_auth=(jira_email, jira_api_token))

def create_issue(title="", description=""):
    try:
        new_issue = jira.create_issue(
            project="OPS",
            summary=title,
            description=description,
            issuetype={'name': "Issue"}
        )
        print(f"✅ New issue created: {new_issue.key}")
        return new_issue
    except Exception as e:
        print(f"❌ Error creating issue: {e}")

def get_total_issues(jql_query="project = OPS"):
    try:
        total = jira.search_issues(jql_query, maxResults=0).total
        print(f"Total issues matching query: {total}")
        return total
    except Exception as e:
        print(f"❌ Error fetching issue count: {e}")
        return 0

