
from task_planner import generate_daily_plan


def replan_tasks(tasks, remaining_minutes):
    unfinished_tasks = [
        task for task in tasks
        if task["status"] == "pending"
    ]

    new_plan = generate_daily_plan(
        unfinished_tasks,
        remaining_minutes
    )

    scheduled_names = {
        item["task"] for item in new_plan
    }

    deferred_tasks = [
        task["name"] for task in unfinished_tasks
        if task["name"] not in scheduled_names
    ]

    return {
        "new_plan": new_plan,
        "deferred_tasks": deferred_tasks
    }


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
        }
    ]

    result = replan_tasks(tasks, 120)

    print("New plan:")
    for item in result["new_plan"]:
        print(item)

    print("Deferred tasks:", result["deferred_tasks"])
