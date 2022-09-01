const nodes = [
  {
    "id": "START",
    "name": "start ATV_VERIFY_PLD_SN process",
    "next": "CONFIG",
    "type": "Start",
    "lane_id": "anyone",
    "parameters": {
      "input_schema": {
        "type": "object",
        "properties": {
          "cpf": {
            "type": "string"
          },
          "creatorId": {
            "type": "string"
          }
        },
        "required": [
          "cpf",
          "creatorId"
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
          "$mustache": "{{{environment.APPROVAL_API_URL}}}/api/approvals/{{{bag.cpf}}}/last"
        },
        "verb": "GET",
        "headers": {
          "Authorization": {
            "$mustache": "LendicoLogin apikey={{{environment.APPROVAL_API_KEY}}}"
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
    "next": "GET-PLD-STATUS",
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
    "id": "GET-PLD-STATUS",
    "name": "get PLD status",
    "next": "CHECK-PLD-PROCESS-STATUS",
    "type": "SystemTask",
    "lane_id": "anyone",
    "category": "HTTP",
    "parameters": {
      "input": {},
      "request": {
        "url": {
          "$mustache": "https://{{{environment.MONEY_LAUNDERING_PREVENTION_URL}}}/document-analysis/{{bag.cpf}}"
        },
        "verb": "GET",
        "headers": {
          "ContentType": "application/json",
          "Authorization": {
            "$mustache": "Bearer {{environment.MONEY_LAUNDERING_PREVENTION_TOKEN}}"
          }
        }
      }
    }
  },
  {
    "id": "CHECK-PLD-PROCESS-STATUS",
    "name": "check if PLD process is done",
    "next": {
      "DONE": "BAG-PLD-STATUS",
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
    "id": "BAG-PLD-STATUS",
    "name": "save PLD status to bag",
    "next": "IS-PLD-APPROVED-OR-INCONCLUSIVE",
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
      "default": "PLD-STATUS-PANIC"
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
    "next": "GET-PLD-STATUS",
    "type": "SystemTask",
    "lane_id": "anyone",
    "category": "timer",
    "parameters": {
      "input": {},
      "timeout": 10
    }
  },
  {
    "id": "IS-PLD-APPROVED-OR-INCONCLUSIVE",
    "name": "check if PLD status is reproved",
    "next": {
      "default": "END-VERIFY-PLD",
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
          "$mustache": "{{{environment.APPROVAL_API_URL}}}/api/approvals/{{bag.approval_id}}/reject"
        },
        "verb": "PUT",
        "headers": {
          "Authorization": {
            "$mustache": "LendicoLogin apikey={{{environment.APPROVAL_API_KEY}}}"
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
    "id": "PLD-STATUS-PANIC",
    "name": "sent alert to NewRelic - get pld status error",
    "next": "END-PLD-STATUS-PANIC",
    "type": "SystemTask",
    "lane_id": "anyone",
    "category": "startProcess",
    "parameters": {
      "input": {
        "cpf": {
          "$ref": "bag.cpf"
        },
        "origin": "VERIFY_PLD",
        "redirect": false,
        "creatorId": {
          "$ref": "bag.creatorId"
        },
        "description": "Error while trying to get PLD status"
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
        "origin": "VERIFY_PLD",
        "redirect": false,
        "creatorId": {
          "$ref": "bag.creatorId"
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
        "origin": "VERIFY_PLD",
        "redirect": false,
        "creatorId": {
          "$ref": "bag.creatorId"
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
    "id": "END-PLD-STATUS-PANIC",
    "name": "end with get PLD status error",
    "next": null,
    "type": "Finish",
    "lane_id": "anyone",
    "parameters": {
      "input": {
        "status": "ERROR",
        "message": "Error while trying to get PLD status"
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
    "id": "END-VERIFY-PLD",
    "name": "end with PLD approved or inconclusive",
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
    "name": "end with PLD reproved",
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
]