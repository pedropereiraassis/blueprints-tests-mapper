module.exports = {
  "name": "Loop Medium BP",
  "description": "Loop medium BP for tests",
  "blueprint_spec": {
    "lanes": [
      {
        "id": "anyone",
        "name": "anyone",
        "rule": [
          "fn",
          [
            "&",
            "args"
          ],
          true
        ]
      },
      {
        "id": "actor_id",
        "name": "actor_id",
        "rule": [
          "fn",
          [
            "actor_data",
            "bag"
          ],
          [
            "=",
            [
              "get",
              "bag",
              [
                "`",
                "actor_id"
              ]
            ],
            [
              "get",
              "actor_data",
              [
                "`",
                "actor_id"
              ]
            ]
          ]
        ]
      }
    ],
    "nodes": [
      {
        "id": "START",
        "name": "start",
        "next": "BAG-ACTOR",
        "type": "Start",
        "lane_id": "anyone",
        "parameters": {
          "timeout": 1200,
          "input_schema": {}
        }
      },
      {
        "id": "BAG-ACTOR",
        "name": "bag actor_id",
        "next": "SHOW-LOGIN",
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
        "id": "SHOW-LOGIN",
        "name": "SHOW LOGIN FORM",
        "next": "LOGIN",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {},
          "action": "LOGIN_FORM",
          "encrypted_data": [
            "user.password"
          ],
          "activity_schema": {
            "type": "object",
            "required": [
              "user"
            ],
            "properties": {
              "user": {
                "type": "object",
                "required": [
                  "password",
                  "cpf_or_email"
                ],
                "properties": {
                  "password": {
                    "type": "object"
                  },
                  "cpf_or_email": {
                    "type": "string"
                  }
                },
                "additionalProperties": false
              }
            },
            "additionalProperties": false
          }
        }
      },
      {
        "id": "LOGIN",
        "name": "post login",
        "next": "CHECK-LOGIN-RESPONSE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "HTTP",
        "parameters": {
          "input": {
            "user": {
              "password": {
                "$decrypt": "result.activities[0].data.user.password"
              },
              "cpf_or_email": {
                "$ref": "result.activities[0].data.user.cpf_or_email"
              }
            }
          },
          "request": {
            "url": {
              "$mustache": "https://api/login"
            },
            "verb": "POST",
            "headers": {
              "ContentType": "application/json"
            }
          }
        }
      },
      {
        "id": "CHECK-LOGIN-RESPONSE",
        "name": "is user authenticated",
        "next": {
          "200": "BAG-LOGIN",
          "201": "BAG-LOGIN",
          "default": "NOTIFY-LOGIN-ERROR"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.status"
            }
          }
        }
      },
      {
        "id": "BAG-LOGIN",
        "name": "bag userid logged",
        "next": "GET-INFO",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "logged_user_id": {
              "$ref": "result.data.data.uuid"
            }
          }
        }
      },
      {
        "id": "NOTIFY-LOGIN-ERROR",
        "name": "NOTIFY-LOGIN-ERROR",
        "next": "END-LOGIN-ERROR",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "status": {
              "$ref": "result.status"
            }
          },
          "action": "NOTIFY_LOGIN_ERROR",
          "timeout": 30
        }
      },
      {
        "id": "GET-INFO",
        "name": "get user info",
        "next": "CHECK-INFO-RESPONSE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/info"
            },
            "verb": "GET",
            "headers": {
              "ContentType": "application/json",
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
              }
            }
          }
        }
      },
      {
        "id": "CHECK-INFO-RESPONSE",
        "name": "check get info response status",
        "next": {
          "200": "GET-TASKS",
          "404": "NOTIFY-INFO-NOT-FOUND",
          "default": "END-INFO-ERROR"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.status"
            }
          }
        }
      },
      {
        "id": "NOTIFY-INFO-NOT-FOUND",
        "name": "NOTIFY INFO NOT FOUND",
        "next": "SAVE-NEW-INFO",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {},
          "action": "NOTIFY_INFO_NOT_FOUND"
        }
      },
      {
        "id": "SAVE-NEW-INFO",
        "name": "post save new info",
        "next": "CHECK-SAVE-INFO-RESPONSE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/info/register"
            },
            "verb": "POST",
            "headers": {
              "ContentType": "application/json",
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
              }
            }
          }
        }
      },
      {
        "id": "CHECK-SAVE-INFO-RESPONSE",
        "name": "does save info response status",
        "next": {
          "200": "GET-TASKS",
          "201": "GET-TASKS",
          "default": "NOTIFY-INFO-NOT-FOUND"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.status"
            }
          }
        }
      },
      {
        "id": "GET-TASKS",
        "name": "get available tasks",
        "next": "BAG-TASKS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/tasks"
            },
            "verb": "GET",
            "headers": {
              "ContentType": "application/json",
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
              }
            }
          }
        }
      },
      {
        "id": "BAG-TASKS",
        "name": "bag tasks",
        "next": "CHECK-TASKS-QTY",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "tasks": {
              "$ref": "result.activities"
            }
          }
        }
      },
      {
        "id": "CHECK-TASKS-QTY",
        "name": "check if there are tasks",
        "next": {
          "0": "CREATE-TASKS",
          "undefined": "CREATE-TASKS",
          "default": "START-TASKS"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "processesLength": {
              "$ref": "bag.processes.length"
            }
          }
        }
      },
      {
        "id": "START-TASKS",
        "name": "start tasks",
        "next": "END-LOGIN",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "startProcess",
        "parameters": {
          "input": {},
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "START_TASKS"
        }
      },
      {
        "id": "CREATE-TASKS",
        "name": "create tasks",
        "next": "START-TASKS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "startProcess",
        "parameters": {
          "input": {},
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "CREATE_TASKS"
        }
      },
      {
        "id": "END-LOGIN",
        "name": "finish success",
        "next": null,
        "type": "Finish",
        "lane_id": "actor_id"
      },
      {
        "id": "END-LOGIN-ERROR",
        "name": "finish from error login",
        "next": null,
        "type": "Finish",
        "lane_id": "actor_id"
      },
      {
        "id": "END-INFO-ERROR",
        "name": "finish terms-conditions",
        "next": null,
        "type": "Finish",
        "lane_id": "actor_id"
      }
    ],
    "prepare": [],
    "environment": {
      "TOKEN": "TOKEN"
    },
    "requirements": [
      "core"
    ]
  }
}