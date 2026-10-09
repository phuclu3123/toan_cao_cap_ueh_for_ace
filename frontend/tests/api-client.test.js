import assert from 'node:assert/strict'
import test from 'node:test'

import { readApiJson } from '../src/utils/apiClient.js'

test('API client rejects an HTML SPA fallback instead of treating it as JSON', async () => {
  const response = new Response('<!doctype html><title>UEH TCC</title>', {
    status: 200,
    headers: { 'content-type': 'text/html; charset=UTF-8' }
  })

  await assert.rejects(
    readApiJson(response),
    (error) => {
      assert.equal(error.code, 'INVALID_API_RESPONSE')
      assert.equal(error.status, 200)
      assert.match(error.message, /phản hồi không hợp lệ/)
      return true
    }
  )
})

test('API client preserves structured backend errors and retry metadata', async () => {
  const response = Response.json(
    { success: false, message: 'Thử lại sau.' },
    { status: 429, headers: { 'retry-after': '30' } }
  )

  await assert.rejects(
    readApiJson(response),
    (error) => {
      assert.equal(error.status, 429)
      assert.equal(error.message, 'Thử lại sau.')
      assert.equal(error.retryAfterSeconds, 30)
      return true
    }
  )
})

test('API client rejects valid JSON with an unexpected top-level shape', async () => {
  for (const body of [null, 'not-an-object', []]) {
    await assert.rejects(
      readApiJson(Response.json(body, { status: 200 })),
      (error) => {
        assert.equal(error.code, 'INVALID_API_RESPONSE')
        assert.equal(error.status, 200)
        return true
      }
    )
  }
})
