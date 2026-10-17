
def prioritize_tasks(tasks):
    """Sort unfinished tasks by deadline urgency."""
    urgency_order = {
        "high": 1,
        "medium": 2,
        "low": 3
    }

    pending_tasks = [
        task for task in tasks
        if task["status"] == "pending"
    ]

    return sorted(
        pending_tasks,
        key=lambda task: (
            urgency_order[task["priority"]],
            task["duration"]
        )
    )


def generate_daily_plan(tasks, available_minutes):
    """Create a schedule without exceeding available time."""
    prioritized = prioritize_tasks(tasks)
    plan = []
    current_minute = 0

    for task in prioritized:
        duration = task["duration"]

        if current_minute + duration > available_minutes:
            continue

        start = current_minute
        end = start + duration

        plan.append({
            "task": task["name"],
            "start_minute": start,
            "end_minute": end,
            "duration": duration
        })

        current_minute = end

    return plan


if __name__ == "__main__":
    tasks = [
        {
            "name": "Math assignment",
            "priority": "high",
            "duration": 60,
            "status": "pending"
        },
        {
            "name": "Python practice",
            "priority": "medium",
            "duration": 45,
            "status": "pending"
        },
        {
            "name": "Java revision",
            "priority": "high",
            "duration": 60,
            "status": "pending"
        },
        {
            "name": "Revise notes",
            "priority": "low",
            "duration": 30,
            "status": "pending"
        }
    ]

    plan = generate_daily_plan(tasks, 180)

    for item in plan:
        print(item)
