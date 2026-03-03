import * as request from "supertest"
const axios = require("axios")

jest.mock("../src/utils/prisma.js",function(){
  return {
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(()=>false),
      create: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(async () => ({
        completedAt: new Date(),
        passengerId: "passenger-1",
        route:{
          driverId: "driver-1",
        }
      })),
    },
  }
})

import prisma from "../src/utils/prisma.js"
import reviewService from "../src/services/review.service.js"

afterEach(() => {
  jest.resetModules();
})

test("TC01 Review after 0 days", async function() {
  const data = {
    "bookingId": "1",
    "rating": 4.5,
    "comment":"Great ride, very comfortable and the driver was friendly!",
    "userId": "passenger-1",
    "driverId": "driver-1",
  }

  await expect(reviewService.createReview(data)).resolves.not.toThrow();
})
test("TC02 Review after 1 day", async function() {
  const data = {
    "bookingId": "1",
    "rating": 4.5,
    "comment":"Great ride, very comfortable and the driver was friendly!",
    "userId": "passenger-1",
    "driverId": "driver-1",
    "now": new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day later
  }
  const review = await reviewService.createReview(data)
  console.log("Review creation response:", review)

  await expect(reviewService.createReview(data)).resolves.not.toThrow();
})
test("TC03 Review after 4 days", async function() {
  const data = {
    "bookingId": "1",
    "rating": 4.5,
    "comment":"Great ride, very comfortable and the driver was friendly!",
    "userId": "passenger-1",
    "driverId": "driver-1",
    "now": new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days later
  }

  await expect(reviewService.createReview(data)).resolves.not.toThrow();
})

test("TC04 Review after 6 days", async function() {
  const data = {
    "bookingId": "1",
    "rating": 4.5,
    "comment":"Great ride, very comfortable and the driver was friendly!",
    "userId": "passenger-1",
    "driverId": "driver-1",
    "now": new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days later
  }

  await expect(reviewService.createReview(data)).resolves.not.toThrow();
})
test("TC05 Review after 7 days", async function() {
  const data = {
    "bookingId": "1",
    "rating": 4.5,
    "comment":"Great ride, very comfortable and the driver was friendly!",
    "userId": "passenger-1",
    "driverId": "driver-1",
    "now": new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days later
  }

  await expect(reviewService.createReview(data)).resolves.not.toThrow();
})
test("TC06 Review after 8 days", async function() {
  const data = {
    "bookingId": "1",
    "rating": 4.5,
    "comment":"Great ride, very comfortable and the driver was friendly!",
    "userId": "passenger-1",
    "driverId": "driver-1",
    "now": new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days later
  }

  await expect(reviewService.createReview(data)).rejects.toThrow("You can create review only within 7 days");
})