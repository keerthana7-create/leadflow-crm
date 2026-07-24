def test_flow_1_lead_capture_assign_status_change(client, admin_headers, member_headers, member_user):
    """
    CORE FLOW 1:
    Public lead capture → Admin assignment to sales rep → Sales rep status update.
    """
    # 1. Unauthenticated Public Lead Capture
    res_cap = client.post("/api/leads/capture", json={
        "name": "Acme Prospect",
        "email": "inbound@acme.com",
        "phone": "+1 555-900-1122",
        "company": "Acme Global",
        "message": "We need 100 enterprise CRM licenses."
    })
    assert res_cap.status_code == 201
    lead_data = res_cap.get_json()["data"]
    lead_id = lead_data["id"]
    assert lead_data["status"] == "New"
    assert lead_data["assigned_to"] is None

    # 2. Admin assigns lead to member_user
    res_assign = client.post(f"/api/leads/{lead_id}/assign", json={
        "user_id": member_user.id
    }, headers=admin_headers)
    assert res_assign.status_code == 200
    assigned_lead = res_assign.get_json()["data"]
    assert assigned_lead["assigned_to"]["id"] == member_user.id

    # 3. Assigned Member updates status to "Contacted"
    res_update = client.put(f"/api/leads/{lead_id}", json={
        "status": "Contacted"
    }, headers=member_headers)
    assert res_update.status_code == 200
    updated_lead = res_update.get_json()["data"]
    assert updated_lead["status"] == "Contacted"

    # 4. Verify Activity Log has recorded all events
    res_act = client.get(f"/api/leads/{lead_id}/activity", headers=member_headers)
    assert res_act.status_code == 200
    activities = res_act.get_json()["data"]
    actions = [a["action"] for a in activities]
    assert any("Lead created" in act for act in actions)
    assert any("assigned" in act for act in actions)
    assert any("status" in act.lower() for act in actions)


def test_flow_2_note_creation_activity_log_entry(client, admin_headers, member_headers, member_user):
    """
    CORE FLOW 2:
    Note creation → Auto-populated activity log entry verification.
    """
    # 1. Create lead
    res_create = client.post("/api/leads", json={
        "name": "Note Test Prospect",
        "email": "notes@test.com",
        "company": "NoteCorp"
    }, headers=admin_headers)
    lead_id = res_create.get_json()["data"]["id"]

    # Assign lead to member
    client.post(f"/api/leads/{lead_id}/assign", json={"user_id": member_user.id}, headers=admin_headers)

    # 2. Member posts a new detailed note
    res_note = client.post(f"/api/leads/{lead_id}/notes", json={
        "body": "Spoke with VP of Sales. Follow up call scheduled for Thursday."
    }, headers=member_headers)
    assert res_note.status_code == 201
    note_data = res_note.get_json()["data"]
    assert note_data["body"] == "Spoke with VP of Sales. Follow up call scheduled for Thursday."
    assert note_data["author"]["id"] == member_user.id

    # 3. Verify note appears in notes list
    res_get_notes = client.get(f"/api/leads/{lead_id}/notes", headers=member_headers)
    assert res_get_notes.status_code == 200
    notes_list = res_get_notes.get_json()["data"]
    assert len(notes_list) >= 1
    assert notes_list[0]["body"] == note_data["body"]

    # 4. Verify Activity Log recorded note addition
    res_act = client.get(f"/api/leads/{lead_id}/activity", headers=member_headers)
    activities = res_act.get_json()["data"]
    actions = [a["action"] for a in activities]
    assert any("Note added" in act for act in actions)
