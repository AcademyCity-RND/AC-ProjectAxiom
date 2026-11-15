from datetime import datetime, timedelta, timezone

try:
    from app.services.event_evidence import assess_event_evidence
except ModuleNotFoundError:
    assess_event_evidence = None


def _comment(author, text, minute=0, *, as_string=False, include_time=True):
    item = {"author_name": author, "text": text}
    if include_time:
        timestamp = datetime(2026, 1, 2, 10, 0, tzinfo=timezone.utc) + timedelta(minutes=minute)
        item["published_at"] = timestamp.isoformat().replace("+00:00", "Z") if as_string else timestamp
    return item


def _edge(source, target, score=0.93):
    return {
        "source_actor": source,
        "target_actor": target,
        "similarity_score": score,
    }


def test_emoji_and_link_only_activity_is_not_coordination_or_automation():
    comments = [
        _comment("alice", "🔥🔥🔥", 0),
        _comment("bob", "https://example.test/story", 1),
        _comment("carol", "🔥 https://example.test/story", 2),
    ]
    clusters = [_edge("alice", "bob"), _edge("bob", "carol")]

    assert callable(assess_event_evidence), "Shared event evidence policy is missing"
    result = assess_event_evidence(comments, clusters)

    assert result["overall_class"] == "SUSPICIOUS"
    assert result["review_status"] == "NEEDS_REVIEW"
    assert result["coordination_indicated"] is False
    assert result["automation_indicated"] is False
    assert {actor["estimated_category"] for actor in result["actors"].values()} == {"SUSPICIOUS"}
