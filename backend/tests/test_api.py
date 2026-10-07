def test_health_probes(client):
    res_livez = client.get("/health/livez")
    assert res_livez.status_code == 200
    assert res_livez.json() == {"status": "alive"}

    res_readyz = client.get("/health/readyz")
    assert res_readyz.status_code == 200
    assert res_readyz.json()["status"] == "ready"


def test_user_registration_and_login(client):
    # Register user
    reg_res = client.post(
        "/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "secretpassword123",
        },
    )
    assert reg_res.status_code == 200
    user_data = reg_res.json()
    assert user_data["username"] == "alice"
    assert user_data["email"] == "alice@example.com"
    assert "id" in user_data

    # Login user
    login_res = client.post(
        "/auth/login",
        data={
            "username": "alice@example.com",
            "password": "secretpassword123",
        },
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Verify /users/me
    me_res = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "alice"


def test_duplicate_user_registration_fails(client):
    client.post(
        "/auth/register",
        json={
            "username": "bob",
            "email": "bob@example.com",
            "password": "password123",
        },
    )

    # Duplicate email
    dup_email = client.post(
        "/auth/register",
        json={
            "username": "bob2",
            "email": "bob@example.com",
            "password": "password123",
        },
    )
    assert dup_email.status_code == 400
    assert "Email already registered" in dup_email.json()["detail"]

    # Duplicate username
    dup_user = client.post(
        "/auth/register",
        json={
            "username": "bob",
            "email": "bob2@example.com",
            "password": "password123",
        },
    )
    assert dup_user.status_code == 400
    assert "Username already taken" in dup_user.json()["detail"]


def test_create_poll_and_voting_flow(client):
    # Register & Login User 1
    client.post(
        "/auth/register",
        json={"username": "u1", "email": "u1@example.com", "password": "pass"},
    )
    u1_login = client.post(
        "/auth/login",
        data={"username": "u1@example.com", "password": "pass"},
    )
    token1 = u1_login.json()["access_token"]

    # Create Poll
    create_res = client.post(
        "/polls",
        headers={"Authorization": f"Bearer {token1}"},
        json={
            "title": "Favorite Language",
            "description": "Pick your favorite programming language",
            "options": ["Python", "Rust", "Go"],
        },
    )
    assert create_res.status_code == 200
    poll_data = create_res.json()
    poll_id = poll_data["id"]
    assert len(poll_data["options"]) == 3

    # Fetch poll options endpoint
    opt_res = client.get(f"/polls/{poll_id}/options")
    assert opt_res.status_code == 200
    options = opt_res.json()
    assert len(options) == 3

    # User 1 votes for Python
    vote_res = client.post(
        "/polls/{}/vote".format(poll_id),
        headers={"Authorization": f"Bearer {token1}"},
        json={"option": "Python"},
    )
    assert vote_res.status_code == 200
    assert vote_res.json()["option"] == "Python"

    # User 1 attempts to vote again -> should be blocked with 400
    dup_vote_res = client.post(
        "/polls/{}/vote".format(poll_id),
        headers={"Authorization": f"Bearer {token1}"},
        json={"option": "Rust"},
    )
    assert dup_vote_res.status_code == 400
    assert "already voted" in dup_vote_res.json()["detail"]

    # User 2 registers and votes for Rust
    client.post(
        "/auth/register",
        json={"username": "u2", "email": "u2@example.com", "password": "pass"},
    )
    u2_login = client.post(
        "/auth/login",
        data={"username": "u2@example.com", "password": "pass"},
    )
    token2 = u2_login.json()["access_token"]

    v2_res = client.post(
        "/polls/{}/vote".format(poll_id),
        headers={"Authorization": f"Bearer {token2}"},
        json={"option": "Rust"},
    )
    assert v2_res.status_code == 200

    # User 2 attempts invalid option vote -> 400
    client.post(
        "/auth/register",
        json={"username": "u3", "email": "u3@example.com", "password": "pass"},
    )
    u3_login = client.post(
        "/auth/login",
        data={"username": "u3@example.com", "password": "pass"},
    )
    token3 = u3_login.json()["access_token"]

    bad_opt_res = client.post(
        "/polls/{}/vote".format(poll_id),
        headers={"Authorization": f"Bearer {token3}"},
        json={"option": "Java"},
    )
    assert bad_opt_res.status_code == 400
    assert "Invalid option" in bad_opt_res.json()["detail"]

    # Fetch Results
    res_data = client.get(f"/polls/{poll_id}/results").json()
    assert res_data["results"]["Python"] == 1
    assert res_data["results"]["Rust"] == 1
    assert res_data["results"]["Go"] == 0
