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
        "id": "actorId",
        "name": "actorId",
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
        "id": "loggedOrActorId",
        "name": "creator or logged user",
        "rule": [
          "fn",
          [
            "actor_data",
            "bag"
          ],
          [
            "or",
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
            ],
            [
              "=",
              [
                "get",
                "bag",
                [
                  "`",
                  "logged_user_id"
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
        ]
      }
    ],
    "nodes": [
      {
        "id": "START",
        "name": "start",
        "next": "ACTOR-BAG",
        "type": "Start",
        "lane_id": "anyone",
        "parameters": {
          "timeout": 1200,
          "input_schema": {}
        }
      },
      {
        "id": "ACTOR-BAG",
        "name": "bag actor_id",
        "next": "LOGIN-FORM",
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
        "id": "LOGIN-FORM",
        "name": "LOGIN-FORM",
        "next": "LOGIN",
        "type": "UserTask",
        "lane_id": "actorId",
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
        "next": "LOGIN-RESPONSE",
        "type": "SystemTask",
        "lane_id": "actorId",
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
        "id": "LOGIN-RESPONSE",
        "name": "is user authenticated",
        "next": {
          "200": "LOGIN-BAG",
          "201": "LOGIN-BAG",
          "206": "LOGIN-BAG",
          "default": "LOGIN-FORM-ERROR"
        },
        "type": "Flow",
        "lane_id": "actorId",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.status"
            }
          }
        }
      },
      {
        "id": "LOGIN-BAG",
        "name": "bag userid and currentloggeduser",
        "next": "TERMS-CONDITIONS",
        "type": "SystemTask",
        "lane_id": "actorId",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "logged_user_id": {
              "$ref": "result.data.data.uuid"
            },
            "currentLoggedUser": {
              "$ref": "result.data"
            }
          }
        }
      },
      {
        "id": "LOGIN-FORM-ERROR",
        "name": "LOGIN_FORM_ERROR",
        "next": "LOGIN-END-ERROR",
        "type": "UserTask",
        "lane_id": "actorId",
        "parameters": {
          "input": {
            "status": {
              "$ref": "result.status"
            }
          },
          "action": "LOGIN_FORM_ERROR",
          "timeout": 30
        }
      },
      {
        "id": "TERMS-CONDITIONS",
        "name": "get api terms conditions last",
        "next": "TERMS-CONDITIONS-RESPONSE",
        "type": "SystemTask",
        "lane_id": "actorId",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/terms_conditions/last"
            },
            "verb": "GET",
            "headers": {
              "ContentType": "application/json",
              "Authorization": {
                "$mustache": "Apikey={{{bag.currentLoggedUser.token}}}"
              }
            }
          }
        }
      },
      {
        "id": "TERMS-CONDITIONS-RESPONSE",
        "name": "does user have accepted terms ",
        "next": {
          "204": "DELIVER-TOKEN-LOGIN",
          "404": "SHOW-TERMS-ACCEPTANCE-MODAL",
          "default": "TERMS-CONDITIONS-END-ERROR"
        },
        "type": "Flow",
        "lane_id": "actorId",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.status"
            }
          }
        }
      },
      {
        "id": "SHOW-TERMS-ACCEPTANCE-MODAL",
        "name": "SHOW_TERMS_ACCEPTANCE_MODAL",
        "next": "TERMS-CONDITIONS-POST",
        "type": "UserTask",
        "lane_id": "actorId",
        "parameters": {
          "input": {},
          "action": "SHOW_TERMS_ACCEPTANCE_MODAL"
        }
      },
      {
        "id": "TERMS-CONDITIONS-POST",
        "name": "post api terms conditions last",
        "next": "TERMS-CONDITIONS-STATUS",
        "type": "SystemTask",
        "lane_id": "actorId",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/terms_conditions/last"
            },
            "verb": "POST",
            "headers": {
              "ContentType": "application/json",
              "Authorization": {
                "$mustache": "Apikey={{{bag.currentLoggedUser.token}}}"
              }
            }
          }
        }
      },
      {
        "id": "TERMS-CONDITIONS-STATUS",
        "name": "does User have accepted terms successfully",
        "next": {
          "200": "DELIVER-TOKEN-LOGIN",
          "201": "DELIVER-TOKEN-LOGIN",
          "206": "DELIVER-TOKEN-LOGIN",
          "default": "SHOW-TERMS-ACCEPTANCE-MODAL"
        },
        "type": "Flow",
        "lane_id": "actorId",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.status"
            }
          }
        }
      },
      {
        "id": "DELIVER-TOKEN-LOGIN",
        "name": "DELIVER_TOKEN_LOGIN",
        "next": "AVAILABLE-PROCESS",
        "type": "UserTask",
        "lane_id": "loggedOrActorId",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.currentLoggedUser.data.cpf"
            },
            "name": {
              "$ref": "bag.name"
            }
          },
          "action": "DELIVER_TOKEN_LOGIN"
        }
      },
      {
        "id": "AVAILABLE-PROCESS",
        "name": "start available process",
        "next": "AVAILABLE-PROCESS-BAG",
        "type": "SystemTask",
        "lane_id": "loggedOrActorId",
        "category": "availableActivities",
        "parameters": {
          "input": {},
          "actor_id": {
            "$ref": "actor_data.actor_id"
          },
          "activity_status": "started",
          "get_only_active_processes": true
        }
      },
      {
        "id": "AVAILABLE-PROCESS-BAG",
        "name": "bag available processes",
        "next": "AVAILABLE-PROCESS-LENGTH",
        "type": "SystemTask",
        "lane_id": "loggedOrActorId",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "processes": {
              "$ref": "result.activities"
            }
          }
        }
      },
      {
        "id": "AVAILABLE-PROCESS-LENGTH",
        "name": "check if there are processes",
        "next": {
          "0": "START-NEW-PROCESS",
          "undefined": "START-NEW-PROCESS",
          "default": "START-USER-PROCESS"
        },
        "type": "Flow",
        "lane_id": "loggedOrActorId",
        "parameters": {
          "input": {
            "processesLength": {
              "$ref": "bag.processes.length"
            }
          }
        }
      },
      {
        "id": "START-USER-PROCESS",
        "name": "redirect user to user main area",
        "next": "USER-PROCESS-END",
        "type": "SystemTask",
        "lane_id": "loggedOrActorId",
        "category": "startProcess",
        "parameters": {
          "input": {
            "name": {
              "$ref": "bag.name"
            }
          },
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "OTHER_BP"
        }
      },
      {
        "id": "START-NEW-PROCESS",
        "name": "create process for users with no processes",
        "next": "START-USER-PROCESS",
        "type": "SystemTask",
        "lane_id": "loggedOrActorId",
        "category": "startProcess",
        "parameters": {
          "input": {},
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "ANOTHER_BP"
        }
      },
      {
        "id": "USER-PROCESS-END",
        "name": "finish user profile",
        "next": null,
        "type": "Finish",
        "lane_id": "loggedOrActorId"
      },
      {
        "id": "LOGIN-END-ERROR",
        "name": "finish from login",
        "next": null,
        "type": "Finish",
        "lane_id": "actorId"
      },
      {
        "id": "TERMS-CONDITIONS-END-ERROR",
        "name": "finish terms-conditions",
        "next": null,
        "type": "Finish",
        "lane_id": "actorId"
      }
    ],
    "prepare": [],
    "environment": {},
    "requirements": [
      "core"
    ]
  }
}