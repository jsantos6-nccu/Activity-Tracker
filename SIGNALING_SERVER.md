# Signaling Server Contract

The app's short-code device linking expects a lightweight signaling server.

## Purpose

The signaling server does not need to see or store activity data. Its job is only to temporarily hold WebRTC offer/answer blobs so two devices can find each other with a short custom code.

## Base URL

In the app's `Devices` tab, the user enters a base URL such as:

`https://your-signal-server.example.com`

The frontend then calls the endpoints below.

## Endpoints

### Create a short-code session

`POST /sessions`

Request body:

```json
{
  "offer": "BASE64_ENCODED_WEBRTC_OFFER",
  "requestedCode": "HOME-LAPTOP"
}
```

Response body:

```json
{
  "code": "HOME-LAPTOP",
  "expiresAt": "2026-04-27T20:15:00.000Z"
}
```

Notes:

- `requestedCode` is optional.
- The server may reject it if already in use or not allowed.
- If rejected, the server may return its own generated code instead.

### Fetch an existing session

`GET /sessions/:code`

Response body before answer:

```json
{
  "code": "HOME-LAPTOP",
  "offer": "BASE64_ENCODED_WEBRTC_OFFER",
  "answer": null,
  "expiresAt": "2026-04-27T20:15:00.000Z"
}
```

Response body after answer:

```json
{
  "code": "HOME-LAPTOP",
  "offer": "BASE64_ENCODED_WEBRTC_OFFER",
  "answer": "BASE64_ENCODED_WEBRTC_ANSWER",
  "expiresAt": "2026-04-27T20:15:00.000Z"
}
```

### Submit the answer

`POST /sessions/:code/answer`

Request body:

```json
{
  "answer": "BASE64_ENCODED_WEBRTC_ANSWER"
}
```

Response body:

```json
{
  "ok": true
}
```

## Recommended behavior

- Expire sessions after a short time, such as 5 to 10 minutes.
- Limit retries and creation rate to reduce brute-force abuse.
- Allow only uppercase letters, numbers, and dashes in custom codes.
- Use HTTPS only.
- Do not log request bodies longer than necessary.
- Delete completed or expired sessions automatically.

## Security note

This server is only for signaling. The live synced data itself still travels directly between devices through the WebRTC data channel after the devices connect.
