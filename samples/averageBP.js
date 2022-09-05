module.exports = {
  "name": "Average BP",
  "description": "Average BP for tests",
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
      }
    ],
    "nodes": [
      {
        "id": "START",
        "name": "start",
        "next": "CONFIG",
        "type": "Start",
        "lane_id": "anyone",
        "parameters": {
          "input_schema": {
            "type": "object",
            "properties": {
              "cpf": {
                "type": "string"
              }
            },
            "required": [
              "cpf"
            ]
          }
        }
      },
      {
        "id": "CONFIG",
        "name": "save process parameters to bag",
        "next": "GET-LAST-APPROVAL",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "counter_retry": {
              "$ref": "environment.COUNTER_RETRY"
            }
          }
        }
      },
      {
        "id": "GET-LAST-APPROVAL",
        "name": "get last approval",
        "next": "GET-APPROVAL-RESPONSE",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/approvals/{{{bag.cpf}}}/last"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{environment.API_KEY}}}"
              }
            }
          }
        }
      },
      {
        "id": "GET-APPROVAL-RESPONSE",
        "name": "check get approval status response code",
        "next": {
          "200": "BAG-APPROVAL",
          "default": "GET-APPROVAL-PANIC"
        },
        "type": "Flow",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "decision": {
              "$ref": "result.status"
            }
          }
        }
      },
      {
        "id": "BAG-APPROVAL",
        "name": "save approval_id to bag",
        "next": "GET-STATUS",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "approval_id": {
              "$ref": "result.data.id"
            }
          }
        }
      },
      {
        "id": "GET-STATUS",
        "name": "get status",
        "next": "CHECK-PROCESS-STATUS",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://document-analysis/{{bag.cpf}}"
            },
            "verb": "GET",
            "headers": {
              "ContentType": "application/json",
              "Authorization": {
                "$mustache": "Bearer {{environment.API_KEY}}"
              }
            }
          }
        }
      },
      {
        "id": "CHECK-PROCESS-STATUS",
        "name": "check if process is done",
        "next": {
          "DONE": "BAG-STATUS",
          "default": "TIMER-COUNT"
        },
        "type": "Flow",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "processes": {
              "$ref": "result.data[0].status"
            }
          }
        }
      },
      {
        "id": "BAG-STATUS",
        "name": "save status to bag",
        "next": "IS-APPROVED-OR-INCONCLUSIVE",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "approved": {
              "$ref": "result.data[0].approved"
            }
          }
        }
      },
      {
        "id": "TIMER-COUNT",
        "name": "bag timer count",
        "next": "RETRY",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "setToBag",
        "parameters": {
          "input": {
            "counter": {
              "$js": "({bag}) => bag.counter ? ++bag.counter : 1"
            }
          }
        }
      },
      {
        "id": "RETRY",
        "name": "check if will retry again",
        "next": {
          "true": "WAIT",
          "default": "STATUS-PANIC"
        },
        "type": "Flow",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "decision": {
              "$js": "({bag}) => bag.counter_retry >= bag.counter"
            }
          }
        }
      },
      {
        "id": "WAIT",
        "name": "timer wait",
        "next": "GET-STATUS",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "timer",
        "parameters": {
          "input": {},
          "timeout": 10
        }
      },
      {
        "id": "IS-APPROVED-OR-INCONCLUSIVE",
        "name": "check if status is reproved",
        "next": {
          "default": "END-VERIFY",
          "false": "REJECT-APPROVAL"
        },
        "type": "Flow",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "processes": {
              "$ref": "bag.approved"
            }
          }
        }
      },
      {
        "id": "REJECT-APPROVAL",
        "name": "reject approval",
        "next": "REJECT-APPROVAL-RESPONSE",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/approvals/{{bag.approval_id}}/reject"
            },
            "verb": "PUT",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{environment.API_KEY}}}"
              }
            }
          }
        }
      },
      {
        "id": "REJECT-APPROVAL-RESPONSE",
        "name": "check reject approval response",
        "next": {
          "200": "END-REPROVED",
          "default": "REJECT-APPROVAL-PANIC"
        },
        "type": "Flow",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "processes": {
              "$ref": "result.status"
            }
          }
        }
      },
      {
        "id": "STATUS-PANIC",
        "name": "sent alert to NewRelic - get status error",
        "next": "END-STATUS-PANIC",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "startProcess",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "description": "Error while trying to get status"
          },
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "PANIC"
        }
      },
      {
        "id": "GET-APPROVAL-PANIC",
        "name": "sent alert to NewRelic - get approval error",
        "next": "END-GET-APPROVAL-PANIC",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "startProcess",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "description": "Error while trying to get approval"
          },
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "PANIC"
        }
      },
      {
        "id": "REJECT-APPROVAL-PANIC",
        "name": "sent alert to NewRelic - reject approval error",
        "next": "END-REJECT-APPROVAL-PANIC",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "startProcess",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "description": "Error while trying to reject approval"
          },
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "PANIC"
        }
      },
      {
        "id": "END-STATUS-PANIC",
        "name": "end with get status error",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "ERROR",
            "message": "Error while trying to get status"
          }
        }
      },
      {
        "id": "END-GET-APPROVAL-PANIC",
        "name": "end with get approval error",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "ERROR",
            "message": "Error while trying to get approval"
          }
        }
      },
      {
        "id": "END-REJECT-APPROVAL-PANIC",
        "name": "end with reject approval error",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "ERROR",
            "message": "Error while trying to reject approval"
          }
        }
      },
      {
        "id": "END-VERIFY",
        "name": "end with status approved or inconclusive",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "APPROVED/INCONCLUSIVE",
            "message": "End process successfully with status approved or inconclusive"
          }
        }
      },
      {
        "id": "END-REPROVED",
        "name": "end with reproved",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "REPROVED",
            "message": "End process successfully with status reproved",
            "approval_id": {
              "$ref": "bag.approval_id"
            }
          }
        }
      }
    ],
    "prepare": [],
    "environment": {
      "COUNTER_RETRY": "COUNTER_RETRY",
      "API_KEY": "API_KEY"
    },
    "requirements": [
      "core"
    ]
  }
}