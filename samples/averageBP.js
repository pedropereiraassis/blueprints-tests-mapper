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
        "next": "GET-TASK-STATUS",
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
        "id": "GET-TASK-STATUS",
        "name": "get task status",
        "next": "CHECK-TASK-RESPONSE",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/tasks"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{{environment.TOKEN}}}"
              }
            }
          }
        }
      },
      {
        "id": "CHECK-TASK-RESPONSE",
        "name": "check get task status response code",
        "next": {
          "200": "BAG-TASK",
          "default": "END-TASK-ERROR"
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
        "id": "BAG-TASK",
        "name": "save task status to bag",
        "next": "GET-SCHEDULE",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "task_status": {
              "$ref": "result.data"
            }
          }
        }
      },
      {
        "id": "GET-SCHEDULE",
        "name": "get schedule",
        "next": "CHECK-SCHEDULE-RESPONSE",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://schedule"
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
        "id": "CHECK-SCHEDULE-RESPONSE",
        "name": "check schedule response",
        "next": {
          "200": "BAG-SCHEDULE",
          "default": "TIMER-COUNT"
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
        "id": "BAG-SCHEDULE",
        "name": "save schedule to bag",
        "next": "IS-SCHEDULE-DONE",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "SetToBag",
        "parameters": {
          "input": {
            "schedule": {
              "$ref": "result.data[0]"
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
          "default": "END-SCHEDULE-ERROR"
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
        "next": "GET-SCHEDULE",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "timer",
        "parameters": {
          "input": {},
          "timeout": 10
        }
      },
      {
        "id": "IS-SCHEDULE-DONE",
        "name": "check if schedule is done",
        "next": {
          "default": "END-SCHEDULE-DONE",
          "false": "DELETE-SCHEDULE"
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
        "id": "DELETE-SCHEDULE",
        "name": "delete schedule",
        "next": "CHECK-DELETION-STATUS",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "HTTP",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/delete/schedule"
            },
            "verb": "DELETE",
            "headers": {
              "Authorization": {
                "$mustache": "Bearer {{{environment.TOKEN}}}"
              }
            }
          }
        }
      },
      {
        "id": "CHECK-DELETION-STATUS",
        "name": "check schedule deletion response",
        "next": {
          "200": "END-SCHEDULE-DELETED",
          "default": "END-DELETION-ERROR"
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
        "id": "END-SCHEDULE-ERROR",
        "name": "end with schedule error",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "ERROR",
            "message": "Error while trying to get schedule"
          }
        }
      },
      {
        "id": "END-TASK-ERROR",
        "name": "end with get task error",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "ERROR",
            "message": "Error while trying to get task"
          }
        }
      },
      {
        "id": "END-DELETION-ERROR",
        "name": "end with schedule deletion error",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "ERROR",
            "message": "Error while trying to delete schedule"
          }
        }
      },
      {
        "id": "END-SCHEDULE-DONE",
        "name": "end with schedule done",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "DONE",
            "message": "End process successfully with schedule done"
          }
        }
      },
      {
        "id": "END-SCHEDULE-DELETED",
        "name": "end with schedule deleted",
        "next": null,
        "type": "Finish",
        "lane_id": "anyone",
        "parameters": {
          "input": {
            "status": "DELETED",
            "message": "End process successfully with schedule deleted"
          }
        }
      }
    ],
    "prepare": [],
    "environment": {
      "COUNTER_RETRY": "COUNTER_RETRY",
      "TOKEN": "TOKEN"
    },
    "requirements": [
      "core"
    ]
  }
}