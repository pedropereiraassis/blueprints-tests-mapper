module.exports = {
  "name": "Medium BP",
  "description": "Medium BP for tests",
  "blueprint_spec": {
    "requirements": ["core"],
    "prepare": [],
    "nodes": [
      {
        "id": "START",
        "name": "Start node",
        "next": "GET-USER",
        "type": "Start",
        "lane_id": "anyone",
        "parameters": {
          "input_schema": {},
          "timeout": 3600
        }
      },
      {
        "id": "GET-USER",
        "name": "Get user",
        "next": "BAG-USER",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/user"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "UserLogin apikey=\"{{{actor_data.token}}}\""
              }
            }
          },
          "valid_response_codes": [
            200,
            204
          ]
        }
      },
      {
        "id": "BAG-USER",
        "name": "Bag user",
        "next": "USER-ACTIVITY",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "setToBag",
        "parameters": {
          "input": {
            "user": {
              "$ref": "result.data"
            }
          }
        }
      },
      {
        "id": "USER-ACTIVITY",
        "name": "Send activity to user",
        "next": "BAG-USER-ACTIVITY",
        "type": "UserTask",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "user": {
              "$ref": "bag.user"
            },
            "actor_id": {
              "$ref": "bag.actor_id"
            }
          },
          "action": "USER_ACTIVITY",
          "activity_manager": "commit"
        }
      },
      {
        "id": "BAG-USER-ACTIVITY",
        "name": "Bag user action",
        "next": "GET-STATUS",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "setToBag",
        "parameters": {
          "input": {
            "user_action": {
              "$ref": "result.activities[0].data.action"
            }
          }
        }
      },
      {
        "id": "GET-STATUS",
        "name": "Get status of user",
        "next": "CHECK-STATUS",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/user/status"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "UserLogin apikey=\"{{{actor_data.token}}}\""
              }
            }
          },
          "valid_response_codes": [
            200,
            204
          ]
        }
      },
      {
        "id": "CHECK-STATUS",
        "name": "Check user status",
        "next": {
          "default": "CHECK-USER-ACTIVITY",
          "ERROR": "NOTIFY-ERROR"
        },
        "type": "Flow",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.data.status"
            }
          }
        }
      },
      {
        "id": "CHECK-USER-ACTIVITY",
        "name": "Check user action",
        "next": {
          "cancel": "END-CANCEL",
          "default": "END-ACTIVITY",
          "continue": "END-CONTINUE"
        },
        "type": "Flow",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "bag.user_action"
            }
          }
        }
      },
      {
        "id": "END-CANCEL",
        "name": "Finish node",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone"
      },
      {
        "id": "END-ACTIVITY",
        "name": "Finish node",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone"
      },
      {
        "id": "NOTIFY-ERROR",
        "name": "User task node",
        "next": "END-ERROR",
        "type": "UserTask",
        "lane_id": "anyone",
        "parameters": {
          "input": {},
          "action": "NOTIFY_ERROR",
          "activity_manager": "notify"
        }
      },
      {
        "id": "END-ERROR",
        "name": "Finish process after CANCELED",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone"
      },
      {
        "id": "END-CONTINUE",
        "name": "Finish process after REDIRECT",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone"
      }
    ],
    "lanes": [
      {
        "id": "anyone",
        "name": "anyone",
        "rule": ["fn", ["&", "args"], true]
      }
    ],
    "environment": {}
  }
}

