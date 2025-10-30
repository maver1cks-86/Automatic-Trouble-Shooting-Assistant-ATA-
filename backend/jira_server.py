from jira import JIRA

jira_server = "your_jira_server_url_here"
jira_email = "your_email_here"
jira_api_token = "your_api_token_here"

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

