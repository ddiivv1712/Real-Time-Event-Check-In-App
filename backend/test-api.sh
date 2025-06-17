#!/bin/bash

echo "Testing GraphQL API..."

# Test getting events
echo "Getting events:"
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { events { id name location startTime attendees { id name email } } }"}' \
  http://localhost:4000/graphql

echo -e "\n\nTesting join event mutation:"
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { joinEvent(eventId: \"YOUR_EVENT_ID\", userEmail: \"test@example.com\") { id attendees { id name email } } }"}' \
  http://localhost:4000/graphql

echo -e "\n\nAPI test complete!"