module.exports = {
  "name": "Very Simple BP",
  "description": "Very simple BP for tests",
  "blueprint_spec": {
    "requirements": ["core"],
    "prepare": [],
    "nodes": [
      {
        "id": "START",
        "type": "Start",
        "name": "Start Pizza 1 WF",
        "next": "ORDER-PIZZA",
        "parameters": {
          "input_schema": {}
        },
        "lane_id": "1"
      },
      {
        "id": "TAKE-ORDER",
        "type": "SystemTask",
        "name": "Take the order",
        "category": "setToBag",
        "next": "PREPARE-PIZZA",
        "lane_id": "1",
        "parameters": {
          "input": {
            "orderNo": { "$js": "() => Math.floor(Math.random() * 100); " }
          }
        }
      },
      {
        "id": "ORDER-PIZZA",
        "type": "SystemTask",
        "name": "Order Pizza",
        "category": "setToBag",
        "next": "TAKE-ORDER",
        "lane_id": "1",
        "parameters": {
          "input": {
            "client": { "$ref": "bag.name" },
            "client1": "teste",
            "pizzas": {
              "qty": 2,
              "flavors": [
                "mussarela", "pepperoni"
              ],
              "olives": false
            }
          }
        }
      },
      {
        "id": "PREPARE-PIZZA",
        "type": "SystemTask",
        "name": "Prepare Pizza",
        "category": "Timer",
        "next": "BRING-PIZZA",
        "lane_id": "1",
        "parameters": {
          "input": {},
          "timeout": 5
        }
      },
      {
        "id": "BRING-PIZZA",
        "type": "SystemTask",
        "category": "SetToBag",
        "name": "Bring Pizza",
        "next": "RECEIVE-PIZZA",
        "lane_id": "1",
        "parameters": {
          "input": {
            "comment": { "$mustache": "check if there are {{bag.pizzas.qty}} pizzas in the bag" }
          }
        }
      },
      {
        "id": "RECEIVE-PIZZA",
        "type": "SystemTask",
        "category": "setToBag",
        "name": "Receive Pizza",
        "next": "END",
        "lane_id": "1",
        "parameters": {
          "input": {
            "confirm": { "$ref": "bag.orderNo" }
          }
        }
      },
      {
        "id": "END",
        "type": "Finish",
        "name": "Finish node",
        "next": null,
        "lane_id": "1"
      }
    ],
    "lanes": [
      {
        "id": "1",
        "name": "the_only_lane",
        "rule": ["fn", ["&", "args"], true]
      }
    ],
    "environment": {}
  }
}