module.exports = {
  "name": "Loop Multiple BP",
  "description": "Loop multiple BP for tests",
  "blueprint_spec": {
    "lanes": [
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
      },
      {
        "id": "anyone",
        "name": "anyone",
        "rule": ["fn", ["&", "args"], true]
      }
    ],
    "nodes": [
      {
        "id": "START",
        "name": "start",
        "next": "GET-USER",
        "type": "Start",
        "lane_id": "anyone",
        "parameters": {
          "timeout": 604800,
          "input_schema": {
            "type": "object",
            "required": [
              "cpf"
            ],
            "properties": {
              "cpf": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }
      },
      {
        "id": "GET-USER",
        "name": "get user",
        "next": "BAG-USER",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/user"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
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
        "name": "bag user",
        "next": "CHECK-USER",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "user": {
              "$ref": "result.data.user"
            }
          }
        }
      },
      {
        "id": "CHECK-USER",
        "name": "check user status",
        "next": {
          "default": "TIMER-COUNT",
          "valid": "GET-USER-DATA"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$js": "({bag}) => bag.user.status"
            }
          }
        }
      },
      {
        "id": "TIMER-COUNT",
        "name": "bag timer counter",
        "next": "RETRY",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "counter": {
              "$js": "({bag}) => { let result = bag.counter + 1; return result }"
            }
          }
        }
      },
      {
        "id": "RETRY",
        "name": "attempts < 6 ?",
        "next": {
          "true": "NOTIFY-RETRY",
          "default": "END-RETRY-ERROR"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "bag.counter"
            }
          }
        }
      },
      {
        "id": "NOTIFY-RETRY",
        "name": "NOTIFY RETRY",
        "next": "TIMER",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "message": "Estamos processando o pedido",
            "current_user": {
              "$ref": "bag.creatorId"
            }
          },
          "action": "NOTIFY_RETRY",
          "timeout": 5,
          "activity_manager": "notify"
        }
      },
      {
        "id": "TIMER",
        "name": "timer wait",
        "next": "GET-USER",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "timer",
        "parameters": {
          "input": {},
          "timeout": 30
        }
      },
      {
        "id": "GET-USER-DATA",
        "name": "get user data",
        "next": "BAG-USER-DATA",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/user/data"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
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
        "id": "BAG-USER-DATA",
        "name": "bag user data",
        "next": "SAVE-ADDITIONAL-INFO",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "user_date": {
              "$ref": "result.data.user_data"
            }
          }
        }
      },
      {
        "id": "SAVE-ADDITIONAL-INFO",
        "name": "save additional info",
        "next": "SHOW-ADDITIONAL-INFO",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/additional-info"
            },
            "verb": "POST",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
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
        "id": "SHOW-ADDITIONAL-INFO",
        "name": "SHOW-ADDITIONAL-INFO",
        "next": "BAG-ADDITIONAL-INFO",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "infos": {
              "$ref": "result.data"
            }
          },
          "action": "SHOW_ADDITIONAL_INFO",
          "activity_manager": "commit"
        }
      },
      {
        "id": "BAG-ADDITIONAL-INFO",
        "name": "bag additional info",
        "next": "GET-ACCOUNT-STATUS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "additional_info": {
              "$ref": "result.activities[0].data"
            }
          }
        }
      },
      {
        "id": "GET-ACCOUNT-STATUS",
        "name": "get account status",
        "next": "BAG-ACCOUNT-STATUS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/account/status"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
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
        "id": "BAG-ACCOUNT-STATUS",
        "name": "bag account status",
        "next": "SHOW-ACCOUNT",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "account_status": {
              "$ref": "result.data"
            }
          }
        }
      },
      {
        "id": "SHOW-ACCOUNT",
        "name": "SHOW ACCOUNT",
        "next": "CHECK-ACCOUNT-ACTION",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "account": {
              "$ref": "result.data"
            }
          },
          "action": "SHOW_ACCOUNT",
          "activity_manager": "commit"
        }
      },
      {
        "id": "CHECK-ACCOUNT-ACTION",
        "name": "chosen action",
        "next": {
          "back": "SAVE-ADDITIONAL-INFO",
          "default": "GET-ACCOUNT-STATUS",
          "continue": "BAG-ACCOUNT"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.activities[0].data.action"
            }
          }
        }
      },
      {
        "id": "BAG-ACCOUNT",
        "name": "bag account",
        "next": "GET-EMAIL",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "account": {
              "$ref": "result.activities[0].data.data"
            }
          }
        }
      },
      {
        "id": "GET-EMAIL",
        "name": "get user email",
        "next": "CHECK-EMAIL",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/email"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "UserLogin Bearer {{environment.TOKEN}}"
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
        "id": "CHECK-EMAIL",
        "name": "check email",
        "next": {
          "unavailable": "EMAIL-FORM",
          "default": "GET-TASKS"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.data"
            }
          }
        }
      },
      {
        "id": "GET-TASKS",
        "name": "get tasks",
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
            "verb": "GET"
          },
          "valid_response_codes": [
            200,
            204
          ]
        }
      },
      {
        "id": "BAG-TASKS",
        "name": "bag tasks",
        "next": "GET-AVAILABLE-TASKS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "tasks": {
              "$js": "({result}) => result.data"
            }
          }
        }
      },
      {
        "id": "GET-AVAILABLE-TASKS",
        "name": "get available tasks",
        "next": "SHOW-TASKS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/tasks/available"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
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
        "id": "SHOW-TASKS",
        "name": "SHOW TASKS",
        "next": "CHECK-TASKS-ACTION",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "tasks": {
              "$ref": "bag.tasks"
            }
          },
          "action": "SHOW_TASKS",
          "activity_manager": "commit"
        }
      },
      {
        "id": "CHECK-TASKS-ACTION",
        "name": "chosen action",
        "next": {
          "back": "GET-ACCOUNT-STATUS",
          "default": "GET-AVAILABLE-TASKS",
          "continue": "REGISTER-NEW-TASK"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.activities[0].data.action"
            }
          }
        }
      },
      {
        "id": "REGISTER-NEW-TASK",
        "name": "post register new task",
        "next": "SHOW-TASKS-INFO",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {
            "$ref": "result.activities[0].data.data"
          },
          "request": {
            "url": {
              "$mustache": "https://api/task/register"
            },
            "verb": "POST",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
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
        "id": "EMAIL-FORM",
        "name": "Email form",
        "next": "CHECK-ACTION",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "email": {
              "$ref": "bag.partner_name"
            }
          },
          "action": "EMAIL_FORM",
          "activity_manager": "commit"
        }
      },
      {
        "id": "CHECK-ACTION",
        "name": "chosen action",
        "next": {
          "back": "GET-ACCOUNT-STATUS",
          "default": "EMAIL-FORM",
          "continue": "SHOW-TASKS-INFO"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.activities[0].data.action"
            }
          }
        }
      },
      {
        "id": "SHOW-TASKS-INFO",
        "name": "show tasks info",
        "next": "CHECK-TASKS-INFO",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "tasks_info": {
              "$ref": "bag.tasks"
            }
          },
          "action": "SHOW_TASKS_INFO",
          "activity_manager": "commit"
        }
      },
      {
        "id": "CHECK-TASKS-INFO",
        "name": "chosen action",
        "next": {
          "default": "REGISTER-NEW-TASK",
          "get available": "GET-AVAILABLE-TASKS",
          "get account status": "GET-ACCOUNT-STATUS",
          "continue": "SAVE-ACOUNT-INFO"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.activities[0].data.action"
            }
          }
        }
      },
      {
        "id": "SAVE-ACOUNT-INFO",
        "name": "post save account info",
        "next": "BAG-ACCOUNT-INFO",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/account/info/save"
            },
            "verb": "POST",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
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
        "id": "BAG-ACCOUNT-INFO",
        "name": "bag account info",
        "next": "CHECK-ACCOUNT-TYPE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "account_info": {
              "$ref": "result.data"
            }
          }
        }
      },
      {
        "id": "CHECK-ACCOUNT-TYPE",
        "name": "check account type",
        "next": {
          "admin": "SET-ADMIN-ACCOUNT",
          "default": "CLOSE-ACCOUNT"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "bag.product_type"
            }
          }
        }
      },
      {
        "id": "SET-ADMIN-ACCOUNT",
        "name": "set admin account",
        "next": "CLOSE-ACCOUNT",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/account/admin"
            },
            "verb": "POST",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
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
        "id": "CLOSE-ACCOUNT",
        "name": "post close account",
        "next": "END-SUCCESS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {
            "$ref": "bag.account"
          },
          "request": {
            "url": {
              "$mustache": "http://api/account/close"
            },
            "verb": "POST",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{environment.TOKEN}}"
              }
            }
          }
        }
      },
      {
        "id": "END-RETRY-ERROR",
        "name": "finish error",
        "next": null,
        "type": "Finish",
        "lane_id": "actor_id"
      },
      {
        "id": "END-SUCCESS",
        "name": "finish",
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