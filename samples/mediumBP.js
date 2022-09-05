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
        "next": "CONFIG",
        "type": "Start",
        "lane_id": "anyone",
        "parameters": {
          "input_schema": {},
          "timeout": 3600
        }
      },
      {
        "id": "CONFIG",
        "name": "Set process parameters do bag",
        "next": "GET-USER",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "setToBag",
        "parameters": {
          "input": {
            "actor_id": {
              "$ref": "actor_data.actor_id"
            }
          }
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
        "next": "USER-VIEW",
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
        "id": "USER-VIEW",
        "name": "Send view to user",
        "next": "BAG-USER-ACTION",
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
          "action": "USER_VIEW",
          "activity_manager": "commit"
        }
      },
      {
        "id": "BAG-USER-ACTION",
        "name": "Bag user action",
        "next": "GET-USER-STATUS",
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
        "id": "GET-USER-STATUS",
        "name": "Get status of user",
        "next": "CHECK-USER-STATUS",
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
        "id": "CHECK-USER-STATUS",
        "name": "Check user status",
        "next": {
          "default": "CHECK-USER-ACTION",
          "CANCELED": "CANCELED-USER"
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
        "id": "CHECK-USER-ACTION",
        "name": "Check user action",
        "next": {
          "cancel": "END-USER",
          "default": "END-VIEW",
          "prosseguir": "REDIRECT"
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
        "id": "REDIRECT",
        "name": "Redirect user",
        "next": "END-REDIRECT",
        "type": "UserTask",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "url": {
              "$mustache": "https://home"
            },
            "actor_id": {
              "$ref": "bag.actor_id"
            }
          },
          "action": "REDIRECT",
          "activity_manager": "commit"
        }
      },
      {
        "id": "END-USER",
        "name": "Finish node",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone"
      },
      {
        "id": "END-VIEW",
        "name": "Finish node",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone"
      },
      {
        "id": "CANCELED-USER",
        "name": "User task node",
        "next": "END-CANCELED",
        "type": "UserTask",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "actor_id": {
              "$ref": "bag.actor_id"
            }
          },
          "action": "CANCELED",
          "activity_manager": "commit"
        }
      },
      {
        "id": "END-CANCELED",
        "name": "Finish process after CANCELED",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone"
      },
      {
        "id": "END-REDIRECT",
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

