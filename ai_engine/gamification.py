
def award_xp(current_xp, priority):
    xp_earned = 20

    if priority == "high":
        xp_earned += 10

    total_xp = current_xp + xp_earned
    level = (total_xp // 100) + 1

    return {
        "xp_earned": xp_earned,
        "total_xp": total_xp,
        "level": level
    }


def check_badges(all_scheduled_tasks_completed):
    badges = []

    if all_scheduled_tasks_completed:
        badges.append("Daily Champion")

    return badges


def update_streak(current_streak, completed_any_task_today,
                  completed_any_task_yesterday):
    if not completed_any_task_today:
        return 0

    if completed_any_task_yesterday:
        return current_streak + 1

    return 1


if __name__ == "__main__":
    result = award_xp(80, "high")
    print("XP earned:", result["xp_earned"])
    print("Total XP:", result["total_xp"])
    print("Level:", result["level"])

    print("Badges:", check_badges(True))
