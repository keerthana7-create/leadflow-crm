def test_login_success(client, admin_user):
    res = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "adminpass"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["user"]["email"] == "admin@test.com"


def test_login_invalid_credentials(client, admin_user):
    res = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data["success"] is False


def test_get_me_unauthorized(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_get_me_success(client, member_headers, member_user):
    res = client.get("/api/auth/me", headers=member_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["user"]["email"] == member_user.email
