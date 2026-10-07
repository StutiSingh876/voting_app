from prometheus_client import Counter

# Authentication
users_registered_total = Counter(
    "users_registered_total",
    "Total registered users"
)

login_success_total = Counter(
    "login_success_total",
    "Total successful logins"
)

login_failed_total = Counter(
    "login_failed_total",
    "Total failed logins"
)

# Polls
polls_created_total = Counter(
    "polls_created_total",
    "Total polls created"
)

# Votes
votes_cast_total = Counter(
    "votes_cast_total",
    "Total votes cast"
)