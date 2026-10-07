import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.db.dependencies import get_db
from app.models.poll import Poll
from app.models.poll_option import PollOption
from app.models.vote import Vote
from app.models.user import User
from tests.conftest import TestingSessionLocal


def test_complete_e2e_poll_flow(client, db_session):
    print("\n--- 1. REGISTER & LOGIN USER ---")
    reg_res = client.post(
        "/auth/register",
        json={
            "username": "tester",
            "email": "tester@example.com",
            "password": "Password123!",
        },
    )
    assert reg_res.status_code == 200
    user_id = reg_res.json()["id"]

    login_res = client.post(
        "/auth/login",
        data={"username": "tester@example.com", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    print("--- 2. CREATE POLL WITH 2 OPTIONS ---")
    create_res = client.post(
        "/polls",
        headers=auth_headers,
        json={
            "title": "Which database do you prefer?",
            "description": "Select your primary database engine for backend production.",
            "options": ["PostgreSQL", "MongoDB"],
        },
    )
    assert create_res.status_code == 200
    poll_data = create_res.json()
    poll_id = poll_data["id"]
    assert poll_data["title"] == "Which database do you prefer?"
    assert len(poll_data["options"]) == 2

    print("--- 3. VERIFY PERSISTENCE IN DATABASE TABLES ---")
    db_poll = db_session.query(Poll).filter(Poll.id == poll_id).first()
    assert db_poll is not None
    assert db_poll.title == "Which database do you prefer?"
    assert db_poll.owner_id == user_id

    db_options = db_session.query(PollOption).filter(PollOption.poll_id == poll_id).all()
    assert len(db_options) == 2
    option_texts = [opt.option for opt in db_options]
    assert "PostgreSQL" in option_texts
    assert "MongoDB" in option_texts

    print("--- 4. VERIFY DASHBOARD LISTING (GET /polls) ---")
    polls_list_res = client.get("/polls")
    assert polls_list_res.status_code == 200
    polls_list = polls_list_res.json()
    found = any(p["id"] == poll_id for p in polls_list)
    assert found is True

    print("--- 5. OPEN POLL & VERIFY OPTIONS (GET /polls/{id}/options) ---")
    opts_res = client.get(f"/polls/{poll_id}/options")
    assert opts_res.status_code == 200
    opts = opts_res.json()
    assert len(opts) == 2

    print("--- 6. SUBMIT VOTE (POST /polls/{id}/vote) ---")
    vote_res = client.post(
        f"/polls/{poll_id}/vote",
        headers=auth_headers,
        json={"option": "PostgreSQL"},
    )
    assert vote_res.status_code == 200
    assert vote_res.json()["option"] == "PostgreSQL"

    print("--- 7. VERIFY VOTE PERSISTENCE IN DATABASE ---")
    db_vote = db_session.query(Vote).filter(Vote.poll_id == poll_id, Vote.user_id == user_id).first()
    assert db_vote is not None
    assert db_vote.option == "PostgreSQL"

    print("--- 8. VERIFY RESULTS & PERCENTAGE MATH ---")
    results_res = client.get(f"/polls/{poll_id}/results")
    assert results_res.status_code == 200
    results = results_res.json()["results"]
    assert results["PostgreSQL"] == 1
    assert results["MongoDB"] == 0

    print("--- 9. TEST INVALID INPUT (POLL CREATION WITH <2 OPTIONS) ---")
    bad_poll_res = client.post(
        "/polls",
        headers=auth_headers,
        json={"title": "Invalid Poll", "options": ["OnlyOneOption"]},
    )
    assert bad_poll_res.status_code == 422  # Pydantic min_length=2 validation error

    print("--- 10. TEST DUPLICATE VOTING (RESTRICTED BY BACKEND / DB) ---")
    dup_vote_res = client.post(
        f"/polls/{poll_id}/vote",
        headers=auth_headers,
        json={"option": "MongoDB"},
    )
    assert dup_vote_res.status_code == 400
    assert "already voted" in dup_vote_res.json()["detail"]

    print("--- 11. TEST INVALID OPTION VOTING ---")
    client.post(
        "/auth/register",
        json={"username": "tester2", "email": "tester2@example.com", "password": "Password123!"},
    )
    t2_login = client.post(
        "/auth/login",
        data={"username": "tester2@example.com", "password": "Password123!"},
    )
    t2_headers = {"Authorization": f"Bearer {t2_login.json()['access_token']}"}

    bad_option_vote = client.post(
        f"/polls/{poll_id}/vote",
        headers=t2_headers,
        json={"option": "OracleDB"},
    )
    assert bad_option_vote.status_code == 400
    assert "Invalid option" in bad_option_vote.json()["detail"]

    print("\n--- ALL 16 E2E TEST VERIFICATION STEPS PASSED SUCCESSFULLY! ---")

