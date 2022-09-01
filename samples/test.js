const nodes = [
  {
    id: 'START',
    name: 'Start REQUEST_DIVIDED',
    next: 'CONFIG',
    type: 'Start',
    lane_id: 'anyone',
    parameters: {
      timeout: 3600,
      input_schema: {
        type: 'object',
        required: [
          'name',
          'birth_dt',
          'cpf',
          'mobile_number',
          'email',
          'partner_name'
        ],
        properties: {
          name: {
            type: 'string'
          },
          birth_dt: {
            type: 'string',
            format: 'date'
          },
          cpf: {
            type: 'string'
          },
          mobile_number: {
            type: 'string'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          partner_name: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    id: 'CONFIG',
    name: 'Bag process parameters',
    next: 'IS-VALID-ACTOR',
    type: 'SystemTask',
    lane_id: 'anyone',
    category: 'setToBag',
    parameters: {
      input: {
        creatorId: {
          $ref: 'actor_data.actor_id'
        }
      }
    }
  },
  {
    id: 'IS-VALID-ACTOR',
    name: 'Check if actor_data is valid',
    next: {
      true: 'DELIVER-TOKEN-USER-EXISTS',
      default: 'FORM-LOAN'
    },
    type: 'Flow',
    lane_id: 'anyone',
    parameters: {
      input: {
        valid_user: {
          $ref: 'actor_data.isValid'
        }
      }
    }
  },
  {
    id: 'FORM-LOAN',
    name: 'Register form - step loan info',
    next: 'CHECK-LOAN-ACTION',
    type: 'UserTask',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        current_user: {
          $ref: 'bag.creatorId'
        },
        lending_purpose: {
          $ref: 'bag.lending_purpose'
        },
        desired_lending_amount: {
          $ref: 'bag.desired_lending_amount'
        }
      },
      action: 'FORM_LOAN',
      activity_schema: {
        type: 'object',
        if: {
          properties: {
            action: {
              const: 'prosseguir'
            }
          }
        },
        then: {
          required: ['data']
        },
        else: {
          required: ['action']
        },
        properties: {
          action: {
            type: 'string'
          },
          data: {
            type: 'object',
            required: ['lending_purpose', 'desired_lending_amount'],
            properties: {
              lending_purpose: {
                type: 'string'
              },
              desired_lending_amount: {
                type: 'integer'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    id: 'CHECK-LOAN-ACTION',
    name: 'Check user action from loan form',
    next: {
      voltar: 'FORM-PERSONAL-DATA',
      default: 'BAG-LOAN-FORM'
    },
    type: 'Flow',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        decision: {
          $ref: 'result.activities[0].data.action'
        }
      }
    }
  },
  {
    id: 'FORM-PERSONAL-DATA',
    name: 'Register form - step personal data',
    next: 'BAG-PERSONAL-FORM',
    type: 'UserTask',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        current_user: {
          $ref: 'bag.creatorId'
        },
        name: {
          $ref: 'bag.name'
        },
        birth_dt: {
          $ref: 'bag.birth_dt'
        },
        cpf: {
          $ref: 'bag.cpf'
        },
        mobile_number: {
          $ref: 'bag.mobile_number'
        },
        email: {
          $ref: 'bag.email'
        }
      },
      action: 'FORM_PERSONAL_DATA',
      activity_schema: {
        type: 'object',
        required: ['action', 'data'],
        properties: {
          action: {
            type: 'string'
          },
          data: {
            type: 'object',
            required: ['name', 'birth_dt', 'cpf', 'mobile_number', 'email'],
            properties: {
              name: {
                type: 'string'
              },
              birth_dt: {
                type: 'string',
                format: 'date'
              },
              cpf: {
                type: 'string'
              },
              mobile_number: {
                type: 'string'
              },
              email: {
                type: 'string',
                format: 'email'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    id: 'BAG-PERSONAL-FORM',
    name: 'Bag personal data form',
    next: 'FORM-LOAN',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'SetToBag',
    parameters: {
      input: {
        name: {
          $ref: 'result.activities[0].data.data.name'
        },
        birth_dt: {
          $ref: 'result.activities[0].data.data.birth_dt'
        },
        cpf: {
          $ref: 'result.activities[0].data.data.cpf'
        },
        mobile_number: {
          $ref: 'result.activities[0].data.data.mobile_number'
        },
        email: {
          $ref: 'result.activities[0].data.data.email'
        }
      }
    }
  },
  {
    id: 'BAG-LOAN-FORM',
    name: 'Bag loan form data',
    next: 'FORM-MORE-INFO',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'SetToBag',
    parameters: {
      input: {
        lending_purpose: {
          $ref: 'result.activities[0].data.data.lending_purpose'
        },
        desired_lending_amount: {
          $ref: 'result.activities[0].data.data.desired_lending_amount'
        }
      }
    }
  },
  {
    id: 'FORM-MORE-INFO',
    name: 'Register form - step more info',
    next: 'CHECK-INFO-ACTION',
    type: 'UserTask',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        current_user: {
          $ref: 'bag.creatorId'
        },
        salary: {
          $ref: 'bag.salary'
        },
        occupation: {
          $ref: 'bag.occupation'
        },
        monthly_income: {
          $ref: 'bag.monthly_income'
        },
        declared_credit_restrictions: {
          $ref: 'bag.declared_credit_restrictions'
        }
      },
      action: 'FORM_MORE_INFO',
      activity_schema: {
        type: 'object',
        if: {
          properties: {
            action: {
              const: 'prosseguir'
            }
          }
        },
        then: {
          required: ['data']
        },
        else: {
          required: ['action']
        },
        properties: {
          action: {
            type: 'string'
          },
          data: {
            type: 'object',
            required: [
              'salary',
              'occupation',
              'monthly_income',
              'declared_credit_restrictions'
            ],
            properties: {
              salary: {
                type: 'integer'
              },
              occupation: {
                type: 'string'
              },
              monthly_income: {
                type: 'integer'
              },
              declared_credit_restrictions: {
                type: 'boolean'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    id: 'CHECK-INFO-ACTION',
    name: 'Check user action from more info form',
    next: {
      voltar: 'FORM-LOAN',
      default: 'BAG-INFO-FORM'
    },
    type: 'Flow',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        decision: {
          $ref: 'result.activities[0].data.action'
        }
      }
    }
  },
  {
    id: 'BAG-INFO-FORM',
    name: 'Bag more info form data',
    next: 'FORM-PASSWORD',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'SetToBag',
    parameters: {
      input: {
        salary: {
          $ref: 'result.activities[0].data.data.salary'
        },
        occupation: {
          $ref: 'result.activities[0].data.data.occupation'
        },
        monthly_income: {
          $ref: 'result.activities[0].data.data.monthly_income'
        },
        declared_credit_restrictions: {
          $ref: 'result.activities[0].data.data.declared_credit_restrictions'
        }
      }
    }
  },
  {
    id: 'FORM-PASSWORD',
    name: 'Register form - step password',
    next: 'CHECK-PASSWORD-ACTION',
    type: 'UserTask',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        current_user: {
          $ref: 'bag.creatorId'
        }
      },
      action: 'FORM_PASSWORD',
      encrypted_data: ['data.password'],
      activity_schema: {
        type: 'object',
        if: {
          properties: {
            action: {
              const: 'prosseguir'
            }
          }
        },
        then: {
          required: ['data']
        },
        else: {
          required: ['action']
        },
        properties: {
          action: {
            type: 'string'
          },
          data: {
            type: 'object',
            required: ['password', 'accept_receive_emails'],
            properties: {
              password: {
                type: 'object'
              },
              accept_receive_emails: {
                type: 'boolean'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    id: 'CHECK-PASSWORD-ACTION',
    name: 'Check user action from password form',
    next: {
      voltar: 'FORM-MORE-INFO',
      default: 'SIGNUP'
    },
    type: 'Flow',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        decision: {
          $ref: 'result.activities[0].data.action'
        }
      }
    }
  },
  {
    id: 'SIGNUP',
    name: 'Signup user to workflow/register',
    next: 'BAG-SIGNUP',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'HTTP',
    parameters: {
      input: {
        cpf: {
          $ref: 'bag.cpf'
        },
        name: {
          $ref: 'bag.name'
        },
        email: {
          $ref: 'bag.email'
        },
        salary: {
          $ref: 'bag.salary'
        },
        birth_dt: {
          $ref: 'bag.birth_dt'
        },
        password: {
          $decrypt: 'result.activities[0].data.data.password'
        },
        occupation: {
          $ref: 'bag.occupation'
        },
        partner_name: {
          $ref: 'bag.partner_name'
        },
        mobile_number: {
          $ref: 'bag.mobile_number'
        },
        monthly_income: {
          $ref: 'bag.monthly_income'
        },
        lending_purpose: {
          $ref: 'bag.lending_purpose'
        },
        accept_receive_emails: {
          $ref: 'bag.accept_receive_emails'
        },
        desired_lending_amount: {
          $ref: 'bag.desired_lending_amount'
        },
        declared_credit_restrictions: {
          $ref: 'bag.declared_credit_restrictions'
        }
      },
      request: {
        url: {
          $mustache: 'https://workflow.{{environment.BASE_URL}}/register'
        },
        verb: 'POST',
        headers: {
          ContentType: 'application/json'
        }
      }
    }
  },
  {
    id: 'BAG-SIGNUP',
    name: 'Bag loggedUser ID and currentUser data',
    next: 'SIGNUP-STATUS',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'SetToBag',
    parameters: {
      input: {
        logged_user_id: {
          $ref: 'result.data.data.uuid'
        },
        currentLoggedUser: {
          cpf: {
            $ref: 'result.data.data.cpf'
          },
          name: {
            $ref: 'result.data.data.profile.name'
          },
          email: {
            $ref: 'result.data.data.email'
          },
          workflow_token: {
            $ref: 'result.data.workflow_token'
          }
        }
      }
    }
  },
  {
    id: 'SIGNUP-STATUS',
    name: 'Check if user registered successfully',
    next: {
      200: 'GET-LAST-APPROVAL',
      201: 'GET-LAST-APPROVAL',
      206: 'DELIVER-TOKEN-USER-EXISTS',
      default: 'FORM-ERROR'
    },
    type: 'Flow',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        decision: {
          $ref: 'result.status'
        }
      }
    }
  },
  {
    id: 'FORM-ERROR',
    name: 'Notify error on form',
    next: 'ERROR-SALESFORCE',
    type: 'UserTask',
    lane_id: 'creatorOnly',
    parameters: {
      input: {
        status: {
          $ref: 'result.status'
        },
        current_user: {
          $ref: 'bag.creatorId'
        }
      },
      action: 'REQUEST_FORM_ERROR',
      encrypted_data: ['password']
    }
  },
  {
    id: 'ERROR-SALESFORCE',
    name: 'start process UPDATE_SALESFORCE - Form error',
    next: 'IS-VALID-ACTOR',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'startProcess',
    parameters: {
      input: {
        cpf: {
          $ref: 'bag.formData.cpf'
        },
        name: {
          $ref: 'bag.formData.name'
        },
        event: {
          status: {
            $ref: 'result.data.message'
          },
          description: 'Insucesso ao criar approval'
        },
        origin: 'REQUEST_DIVIDED',
        creatorId: {
          $ref: 'bag.creatorId'
        }
      },
      actor_data: {
        $ref: 'actor_data'
      },
      workflow_name: 'UPDATE_SALESFORCE'
    }
  },
  {
    id: 'GET-LAST-APPROVAL',
    name: 'Get user last approval',
    next: 'BAG-APPROVAL-ID',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'http',
    parameters: {
      input: {},
      request: {
        url: {
          $mustache:
            '{{{environment.APPROVAL_API_URL}}}/api/approvals/{{{bag.currentLoggedUser.cpf}}}/last'
        },
        verb: 'GET',
        headers: {
          Authorization: {
            $mustache:
              'LendicoLogin apikey="{{{environment.APPROVAL_API_KEY}}}"'
          }
        }
      },
      valid_response_codes: [200, 204]
    }
  },
  {
    id: 'BAG-APPROVAL-ID',
    name: 'Bag user last approval id',
    next: 'SALESFORCE',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'setToBag',
    parameters: {
      input: {
        approval_id: {
          $ref: 'result.data.id'
        }
      }
    }
  },
  {
    id: 'SALESFORCE',
    name: 'start process UPDATE_SALESFORCE - Register success',
    next: 'DELIVER-TOKEN',
    type: 'SystemTask',
    lane_id: 'creatorOnly',
    category: 'startProcess',
    parameters: {
      input: {
        cpf: {
          $ref: 'bag.currentLoggedUser.cpf'
        },
        name: {
          $ref: 'bag.currentLoggedUser.name'
        },
        origin: 'REQUEST_DIVIDED',
        creatorId: {
          $ref: 'bag.logged_user_id'
        },
        approval_id: {
          $ref: 'bag.approval_id'
        }
      },
      actor_data: {
        $ref: 'actor_data'
      },
      workflow_name: 'UPDATE_SALESFORCE'
    }
  },
  {
    id: 'DELIVER-TOKEN',
    name: 'Deliver workflow token to front',
    next: 'START-REQUEST-RESPONSE',
    type: 'UserTask',
    lane_id: 'creatorOrLogged',
    parameters: {
      input: {
        current_user: {
          $ref: 'bag.creatorId'
        },
        workflow_token: {
          $ref: 'bag.currentLoggedUser.workflow_token'
        }
      },
      action: 'DELIVER_WORKFLOW_TOKEN_REQUEST'
    }
  },
  {
    id: 'START-REQUEST-RESPONSE',
    name: 'Start process REQUEST_RESPONSE',
    next: 'END-REQUEST-RESPONSE',
    type: 'SystemTask',
    lane_id: 'creatorOrLogged',
    category: 'startProcess',
    parameters: {
      input: {
        cpf: {
          $ref: 'bag.currentLoggedUser.cpf'
        },
        name: {
          $ref: 'bag.currentLoggedUser.name'
        },
        origin: 'REQUEST',
        creatorId: {
          $ref: 'bag.logged_user_id'
        },
        approval_id: {
          $ref: 'bag.approval_id'
        },
        workflow_token: {
          $ref: 'bag.currentLoggedUser.workflow_token'
        }
      },
      actor_data: {
        $ref: 'actor_data'
      },
      workflow_name: 'ACQ_REQUEST_RESPONSE'
    }
  },
  {
    id: 'DELIVER-TOKEN-USER-EXISTS',
    name: 'Deliver workflow token to front when user exists',
    next: 'GET-AVAILABLE-PROCESSES',
    type: 'UserTask',
    lane_id: 'creatorOrLogged',
    parameters: {
      input: {
        current_user: {
          $ref: 'bag.creatorId'
        },
        workflow_token: {
          $ref: 'bag.currentLoggedUser.workflow_token'
        }
      },
      action: 'DELIVER_WORKFLOW_TOKEN_REQUEST_USER_EXISTS'
    }
  },
  {
    id: 'GET-AVAILABLE-PROCESSES',
    name: 'Get available processes for actor',
    next: 'BAG-AVAILABLE-PROCESSES',
    type: 'SystemTask',
    lane_id: 'creatorOrLogged',
    category: 'HTTP',
    parameters: {
      input: {},
      request: {
        url: {
          $mustache:
            'https://workflow.{{environment.BASE_URL}}/processes/available'
        },
        verb: 'GET',
        headers: {
          ContentType: 'application/json',
          Authorization: {
            $mustache: 'Bearer {{bag.currentLoggedUser.workflow_token}}'
          }
        }
      }
    }
  },
  {
    id: 'BAG-AVAILABLE-PROCESSES',
    name: 'Bag available processes for actor',
    next: 'CHECK-PROCESSES-QTY',
    type: 'SystemTask',
    lane_id: 'creatorOrLogged',
    category: 'SetToBag',
    parameters: {
      input: {
        processes: {
          $ref: 'result.data'
        }
      }
    }
  },
  {
    id: 'CHECK-PROCESSES-QTY',
    name: 'Check if there a non-RET active process',
    next: {
      0: 'START-CREATE-PROCESS',
      undefined: 'START-CREATE-PROCESS',
      default: 'AVAILABLE-PROCESS'
    },
    type: 'Flow',
    lane_id: 'creatorOrLogged',
    parameters: {
      input: {
        workflows: {
          $js: '({ bag }) =>\n                bag.processes.filter(\n                  (p) =>\n                    !p.workflow_name.startsWith("RET") &&\n                    p.workflow_name !== "ACQ_LOGIN" &&\n                    p.workflow_name !== "ACQ_REQUEST" &&\n                    p.workflow_name !== "ACQ_REQUEST_PASSWORD_RESET" &&\n                    p.workflow_name !== "CREATE_PROCESS_USER_WITHOUT_PROCESS"\n                ).length'
        }
      }
    }
  },
  {
    id: 'AVAILABLE-PROCESS',
    name: 'Show availabe process',
    next: 'END-AVAILABLE-PROCESS',
    type: 'UserTask',
    lane_id: 'loggedOnly',
    parameters: {
      input: {
        process: {
          $ref: 'bag.processes'
        },
        current_user: {
          $ref: 'bag.logged_user_id'
        }
      },
      action: 'AVAILABLE_PROCESS'
    }
  },
  {
    id: 'START-CREATE-PROCESS',
    name: 'Start process CREATE_PROCESS_USER_WITHOUT_PROCESS',
    next: 'END-CREATE-PROCESS',
    type: 'SystemTask',
    lane_id: 'creatorOrLogged',
    category: 'HTTP',
    parameters: {
      input: {
        cpf: {
          $ref: 'bag.currentLoggedUser.cpf'
        },
        workflow_token: {
          $ref: 'bag.currentLoggedUser.workflow_token'
        }
      },
      request: {
        url: {
          $mustache:
            'https://workflow.{{environment.BASE_URL}}/workflows/name/CREATE_PROCESS_USER_WITHOUT_PROCESS/start'
        },
        verb: 'POST',
        headers: {
          ContentType: 'application/json',
          Authorization: {
            $mustache: 'Bearer {{bag.currentLoggedUser.workflow_token}}'
          }
        }
      }
    }
  },
  {
    id: 'END-REQUEST-RESPONSE',
    name: 'Finish to REQUEST_RESPONSE',
    next: null,
    type: 'Finish',
    lane_id: 'creatorOrLogged'
  },
  {
    id: 'END-CREATE-PROCESS',
    name: 'Finish to CREATE_PROCESS',
    next: null,
    type: 'Finish',
    lane_id: 'creatorOrLogged'
  },
  {
    id: 'END-AVAILABLE-PROCESS',
    name: 'Finish on available process showed',
    next: null,
    type: 'Finish',
    lane_id: 'loggedOnly'
  }
]