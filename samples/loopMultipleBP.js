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
        "next": "ACTOR-BAG",
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
        "id": "ACTOR-BAG",
        "name": "bag creatorid and newrelic event",
        "next": "GET-LAST-APPROVAL",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "setToBag",
        "parameters": {
          "input": {
            "actorId": {
              "$ref": "actor_data.actor_id"
            }
          }
        }
      },
      {
        "id": "GET-LAST-APPROVAL",
        "name": "get api approval last",
        "next": "APPROVAL-DATA-BAG",
        "type": "SystemTask",
        "lane_id": "anyone",
        "category": "http",
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
          },
          "valid_response_codes": [
            200,
            204
          ]
        }
      },
      {
        "id": "APPROVAL-DATA-BAG",
        "name": "bag approval stage and status",
        "next": "APPROVAL-CHECK",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "approval_stage": {
              "$ref": "result.data.input_data.stage"
            },
            "approval_status": {
              "$ref": "result.data.status"
            }
          }
        }
      },
      {
        "id": "APPROVAL-CHECK",
        "name": "switch approval status",
        "next": {
          "default": "COUNTER-BAG",
          "POST_APPROVAL": "PRODUCT-BAG"
        },
        "type": "Flow",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "decision": {
              "$js": "({bag}) => bag.approval_stage || bag.approval_status"
            }
          }
        }
      },
      {
        "id": "PRODUCT-BAG",
        "name": "bag product type",
        "next": "GET-PROFILE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "partner_name": {
              "$ref": "result.data.policy.partner.name"
            },
            "product_type": {
              "$ref": "result.data.policy.product.code"
            }
          }
        }
      },
      {
        "id": "COUNTER-BAG",
        "name": "bag counter",
        "next": "COUNTER-CHECK",
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
        "id": "COUNTER-CHECK",
        "name": "attempts < 6 ?",
        "next": {
          "6": "PANIC",
          "default": "ALERT-USER"
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
        "id": "PANIC",
        "name": "Start BP PANIC",
        "next": "END-PANIC",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "startProcess",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "name": {
              "$ref": "bag.name"
            },
            "approval_id": {
              "$ref": "bag.approval_id"
            },
            "description": "unexpected profile status"
          },
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "PANIC"
        }
      },
      {
        "id": "ALERT-USER",
        "name": "ALERT_USER",
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
          "action": "ALERT_USER",
          "timeout": 5,
          "activity_manager": "notify"
        }
      },
      {
        "id": "TIMER",
        "name": "timer wait",
        "next": "GET-LAST-APPROVAL",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "timer",
        "parameters": {
          "input": {},
          "timeout": 30
        }
      },
      {
        "id": "GET-PROFILE",
        "name": "get api user profile",
        "next": "PERIOD-AND-LENDING-BAG",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/profile"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{actor_data.token}}}"
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
        "id": "PERIOD-AND-LENDING-BAG",
        "name": "bag grace period and lending option",
        "next": "DATES-OPTIONS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "grace_period": {
              "$ref": "result.data.lending_option.grace_period"
            },
            "lending_option": {
              "$ref": "result.data.lending_option"
            }
          }
        }
      },
      {
        "id": "DATES-OPTIONS",
        "name": "get api approval date options",
        "next": "CHOOSE-LOAN-GRACE-PERIOD",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api./approval/dates_options"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{actor_data.token}}}"
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
        "id": "CHOOSE-LOAN-GRACE-PERIOD",
        "name": "CHOOSE_LOAN_GRACE_PERIOD",
        "next": "GRACE-PERIOD-BAG",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "name": {
              "$ref": "bag.name"
            },
            "current_user": {
              "$ref": "bag.creatorId"
            },
            "grace_period": {
              "$ref": "bag.grace_period"
            },
            "best_proposal_url": {
              "$mustache": "https://api./approval/best_proposal"
            },
            "grace_periods_dates": {
              "$ref": "result.data.grace_periods_dates"
            },
            "authorization_header": {
              "$mustache": "Apikey={{{actor_data.token}}}"
            }
          },
          "action": "CHOOSE_LOAN_GRACE_PERIOD",
          "activity_manager": "commit"
        }
      },
      {
        "id": "GRACE-PERIOD-BAG",
        "name": "bag grace period",
        "next": "APPROVAL-STATUS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "grace_period": {
              "$ref": "result.activities[0].data.data.grace_period"
            }
          }
        }
      },
      {
        "id": "APPROVAL-STATUS",
        "name": "get api approval status",
        "next": "APPROVAL-STATUS-BAG",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/approval"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{actor_data.token}}}"
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
        "id": "APPROVAL-STATUS-BAG",
        "name": "bag flow type",
        "next": "CHOOSE-LOAN-VALUE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "flow_type": {
              "$ref": "result.data.flow_type"
            }
          }
        }
      },
      {
        "id": "CHOOSE-LOAN-VALUE",
        "name": "CHOOSE_LOAN_VALUE",
        "next": "CHECK-LOAN-VALUE-ACTION",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "name": {
              "$ref": "bag.name"
            },
            "current_user": {
              "$ref": "bag.creatorId"
            },
            "grace_period": {
              "$ref": "bag.grace_period"
            },
            "approval_data": {
              "$ref": "result.data"
            },
            "lending_option": {
              "$ref": "bag.lending_option"
            },
            "best_proposal_url": {
              "$mustache": "https://api/approval/best_proposal"
            },
            "authorization_header": {
              "$mustache": "Apikey={{{actor_data.token}}}"
            }
          },
          "action": "CHOOSE_LOAN_VALUE",
          "activity_manager": "commit"
        }
      },
      {
        "id": "CHECK-LOAN-VALUE-ACTION",
        "name": "chosen action",
        "next": {
          "voltar": "DATES-OPTIONS",
          "default": "APPROVAL-STATUS",
          "prosseguir": "LENDING-BAG"
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
        "id": "LENDING-BAG",
        "name": "bag lending option",
        "next": "LENDING-OPTION",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "lending_option": {
              "$ref": "result.activities[0].data.data"
            }
          }
        }
      },
      {
        "id": "LENDING-OPTION",
        "name": "post api profile lending option",
        "next": "CHECK-PRODUCT-TYPE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {
            "$ref": "result.activities[0].data.data"
          },
          "request": {
            "url": {
              "$mustache": "https://api/profile"
            },
            "verb": "POST",
            "headers": {
              "Authorization": {
                "$mustache": "UserLogin apikey={{{actor_data.token}}}"
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
        "id": "CHECK-PRODUCT-TYPE",
        "name": "product type",
        "next": {
          "EWALLET": "DIGITAL-WALLET",
          "default": "BANKS-LIST"
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
        "id": "BANKS-LIST",
        "name": "get list api banks",
        "next": "BANK-BAG",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/banks-list"
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
        "id": "BANK-BAG",
        "name": "bag order bank list",
        "next": "GET-USER-PROFILE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "banks": {
              "$js": "({result}) => result.data.banks.filter(b => !b.priority)"
            },
            "prioritized_banks": {
              "$js": "({result}) => result.data.banks.filter(b => !!b.priority)"
            }
          }
        }
      },
      {
        "id": "GET-USER-PROFILE",
        "name": "get api user profile",
        "next": "BANK-DATA",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/profile"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{actor_data.token}}}"
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
        "id": "BANK-DATA",
        "name": "BANK_DATA",
        "next": "CHECK-BANK-ACTION",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "bank": {
              "$ref": "result.data.bank"
            },
            "name": {
              "$ref": "bag.name"
            },
            "banks": {
              "$ref": "bag.banks"
            },
            "current_user": {
              "$ref": "bag.creatorId"
            },
            "best_proposal_url": {
              "$mustache": "https://api/approval/best_proposal"
            },
            "prioritized_banks": {
              "$ref": "bag.prioritized_banks"
            },
            "authorization_header": {
              "$mustache": "Apikey={{{actor_data.token}}}"
            }
          },
          "action": "BANK_DATA",
          "activity_manager": "commit",
          "activity_schema": {
            "type": "object",
            "required": [
              "data",
              "action"
            ],
            "properties": {
              "data": {
                "type": "object",
                "required": [
                  "code",
                  "name",
                  "agency",
                  "account",
                  "account_digit"
                ],
                "properties": {
                  "code": {
                    "type": "string"
                  },
                  "name": {
                    "type": "string"
                  },
                  "agency": {
                    "type": "string"
                  },
                  "account": {
                    "type": "string"
                  },
                  "account_digit": {
                    "type": "string"
                  }
                }
              },
              "action": {
                "type": "string"
              }
            }
          }
        }
      },
      {
        "id": "CHECK-BANK-ACTION",
        "name": "chosen action",
        "next": {
          "voltar": "APPROVAL-STATUS",
          "default": "GET-USER-PROFILE",
          "prosseguir": "PROFILE-BANK"
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
        "id": "PROFILE-BANK",
        "name": "post api profile bank data",
        "next": "CONTRACT-PROPOSAL",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {
            "$ref": "result.activities[0].data.data"
          },
          "request": {
            "url": {
              "$mustache": "https://api/profile/bank"
            },
            "verb": "POST",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{actor_data.token}}}"
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
        "id": "DIGITAL-WALLET",
        "name": "DIGITAL_WALLET",
        "next": "CHECK-WALLET-DECISION",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "current_user": {
              "$ref": "bag.creatorId"
            },
            "partner_name": {
              "$ref": "bag.partner_name"
            }
          },
          "action": "DIGITAL_WALLET",
          "activity_manager": "commit"
        }
      },
      {
        "id": "CHECK-WALLET-DECISION",
        "name": "chosen action",
        "next": {
          "voltar": "APPROVAL-STATUS",
          "default": "DIGITAL-WALLET",
          "prosseguir": "CONTRACT-PROPOSAL"
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
        "id": "CONTRACT-PROPOSAL",
        "name": "get api contract proposal",
        "next": "CONFIRM-LOAN-DETAILS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "https://api/contract/proposal"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{actor_data.token}}}"
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
        "id": "CONFIRM-LOAN-DETAILS",
        "name": "CONFIRM_LOAN_DETAILS",
        "next": "CHECK-CONFIRM-LOAN-ACTION",
        "type": "UserTask",
        "lane_id": "actor_id",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "name": {
              "$ref": "bag.name"
            },
            "actions": {
              "edit_bank": "editar conta",
              "edit_value": "editar valores",
              "request_loan": "solicitar emprestimo"
            },
            "proposal": {
              "$ref": "result.data"
            },
            "flow_type": {
              "$ref": "bag.flow_type"
            },
            "current_user": {
              "$ref": "bag.creatorId"
            },
            "partner_name": {
              "$ref": "bag.partner_name"
            },
            "product_type": {
              "$ref": "bag.product_type"
            },
            "best_proposal_url": {
              "$mustache": "https://api/approval/best_proposal"
            },
            "authorization_header": {
              "$mustache": "Apikey={{{actor_data.token}}}"
            }
          },
          "action": "CONFIRM_LOAN_DETAILS",
          "activity_manager": "commit"
        }
      },
      {
        "id": "CHECK-CONFIRM-LOAN-ACTION",
        "name": "chosen action",
        "next": {
          "default": "CONTRACT-PROPOSAL",
          "editar conta": "GET-USER-PROFILE",
          "editar valores": "APPROVAL-STATUS",
          "solicitar emprestimo": "GET-APPROVAL"
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
        "id": "GET-APPROVAL",
        "name": "get api approval last",
        "next": "APPROVAL-BAG",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
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
          },
          "valid_response_codes": [
            200,
            204
          ]
        }
      },
      {
        "id": "APPROVAL-BAG",
        "name": "bag last approval",
        "next": "GET-PROFILE-BY-ACTOR",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "approval": {
              "$ref": "result.data"
            }
          }
        }
      },
      {
        "id": "GET-PROFILE-BY-ACTOR",
        "name": "get api environment profile",
        "next": "PROFILE-BAG",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/profiles/{{{actor_data.actor_id}}}"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{environment.API_KEY}}}"
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
        "id": "PROFILE-BAG",
        "name": "bag user profile",
        "next": "GET-USER",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "user_profile": {
              "$ref": "result.data"
            }
          }
        }
      },
      {
        "id": "GET-USER",
        "name": "get api user",
        "next": "USER-BAG",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/users/{{{actor_data.actor_id}}}"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{environment.API_KEY}}}"
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
        "id": "USER-BAG",
        "name": "bag user",
        "next": "CHECK-PRODUCT",
        "type": "SystemTask",
        "lane_id": "actor_id",
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
        "id": "CHECK-PRODUCT",
        "name": "product type",
        "next": {
          "EWALLET": "INBOUND-PARTNER",
          "default": "REQUEST-BAG"
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
        "id": "INBOUND-PARTNER",
        "name": "get inbound partner",
        "next": "PARTNER-BAG",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {},
          "request": {
            "url": {
              "$mustache": "http://api/partners?name={{{bag.approval.input_data.sub_origin}}}"
            },
            "verb": "GET",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{environment.API_KEY}}}"
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
        "id": "PARTNER-BAG",
        "name": "bag partner",
        "next": "REQUEST-BAG",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "partner": {
              "$ref": "result.data.partners[0]"
            }
          }
        }
      },
      {
        "id": "REQUEST-BAG",
        "name": "bag build request body",
        "next": "CONTRACT",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "setToBag",
        "parameters": {
          "input": {
            "ContractRequestBody": {
              "user": {
                "$ref": "bag.user"
              },
              "partner": {
                "$ref": "bag.approval.policy.partner"
              },
              "profile": {
                "$ref": "bag.user_profile"
              },
              "approval": {
                "$ref": "bag.approval"
              },
              "user_uuid": {
                "$ref": "bag.creatorId"
              },
              "approval_id": {
                "$ref": "bag.approval.id"
              },
              "grace_period": {
                "$ref": "bag.user_profile.lending_option.grace_period"
              },
              "lending_value": {
                "$ref": "bag.user_profile.lending_option.lending_value"
              },
              "profile_company": {
                "$ref": "bag.partner.company"
              },
              "lending_installments": {
                "$ref": "bag.user_profile.lending_option.lending_installments"
              }
            }
          }
        }
      },
      {
        "id": "CONTRACT",
        "name": "post api contract",
        "next": "SIGN-CONTRACT",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "http",
        "parameters": {
          "input": {
            "$ref": "bag.ContractRequestBody"
          },
          "request": {
            "url": {
              "$mustache": "http://api/contracts"
            },
            "verb": "POST",
            "headers": {
              "Authorization": {
                "$mustache": "Apikey={{{environment.API_KEY}}}"
              }
            }
          }
        }
      },
      {
        "id": "SIGN-CONTRACT",
        "name": "start SIGN_CONTRACT",
        "next": "UPDATE-SALESFORCE",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "startProcess",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "name": {
              "$ref": "bag.name"
            },
            "origin": "CHOOSE_LOANS_DETAILS_SN",
            "creatorId": {
              "$ref": "bag.creatorId"
            },
            "approval_id": {
              "$ref": "bag.approval_id"
            },
            "contractNumber": {
              "$ref": "result.data.number"
            }
          },
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "ATV_SIGN_CONTRACT_SN"
        }
      },
      {
        "id": "UPDATE-SALESFORCE",
        "name": "start UPDATE_SALESFORCE",
        "next": "END-SUCCESS",
        "type": "SystemTask",
        "lane_id": "actor_id",
        "category": "startProcess",
        "parameters": {
          "input": {
            "cpf": {
              "$ref": "bag.cpf"
            },
            "name": {
              "$ref": "bag.name"
            },
            "event": {
              "description": "Contrato gerado"
            },
            "creatorId": {
              "$ref": "bag.creatorId"
            },
            "approval_id": {
              "$ref": "bag.approval_id"
            }
          },
          "actor_data": {
            "$ref": "actor_data"
          },
          "workflow_name": "UPDATE_SALESFORCE"
        }
      },
      {
        "id": "END-PANIC",
        "name": "finish error",
        "next": null,
        "type": "Finish",
        "lane_id": "actor_id"
      },
      {
        "id": "END-SUCCESS",
        "name": "finish choose laoan details",
        "next": null,
        "type": "Finish",
        "lane_id": "actor_id"
      }
    ],
    "prepare": [],
    "environment": {
      "API_KEY": "API_KEY"
    },
    "requirements": [
      "core"
    ]
  }
}