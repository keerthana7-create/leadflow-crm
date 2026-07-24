def test_member_cannot_reassign_lead(client, member_headers, member_user, other_member_user):
    # Public lead capture
    res_cap = client.post("/api/leads/capture", json={
        "name": "Permission Test Lead",
        "email": "perm@test.com"
    })
    lead_id = res_cap.get_json()["data"]["id"]

    # Member attempts to assign lead -> should get 403 Forbidden
    res = client.post(f"/api/leads/{lead_id}/assign", json={
        "user_id": other_member_user.id
    }, headers=member_headers)

    assert res.status_code == 403
    assert res.get_json()["success"] is False
    assert "Admin privileges required" in res.get_json()["message"]


def test_member_cannot_access_user_management(client, member_headers):
    # Member attempts GET /api/users -> should get 403 Forbidden
    res = client.get("/api/users", headers=member_headers)
    assert res.status_code == 403

    # Member attempts POST /api/users -> should get 403 Forbidden
    res = client.post("/api/users", json={
        "name": "New User",
        "email": "new@test.com",
        "password": "password123"
    }, headers=member_headers)
    assert res.status_code == 403


def test_member_cannot_view_unassigned_lead(client, member_headers, other_member_headers, other_member_user, admin_headers):
    # Create lead assigned to other_member_user
    res_create = client.post("/api/leads", json={
        "name": "Other Rep Lead",
        "email": "otherrep@test.com"
    }, headers=admin_headers)
    lead_id = res_create.get_json()["data"]["id"]

    # Assign to other_member_user
    client.post(f"/api/leads/{lead_id}/assign", json={"user_id": other_member_user.id}, headers=admin_headers)

    # First member tries to GET /api/leads/:id -> should be 403 Forbidden
    res = client.get(f"/api/leads/{lead_id}", headers=member_headers)
    assert res.status_code == 403
