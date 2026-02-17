import { test, expect, afterEach, beforeEach } from "@jest/globals"
import cron from "../src/cron/cleanupCron"
import user_service from "../src/services/user.service"

var id
const fakeUrl = "https://fake-url.com/photo.jpg"
const data = {
	email: "test@gmail.com",
	username: "TestUser",
	password: "123456",
	firstName: "Test",
	lastName: "User",
	phoneNumber: "0812345678",
	gender: "MALE",
	nationalIdNumber: "1234567891234",
	nationalIdExpiryDate: new Date("2030-12-31T00:00:00.000Z"), // แปลง string เป็น Date object
	nationalIdPhotoUrl: fakeUrl,
	selfiePhotoUrl: fakeUrl,
}

function setDate(minusDay) {
	let date = new Date()
	date.setDate(date.getDate() - minusDay)
	return date
}

beforeEach(async function() {
	await user_service.createUser(data)
	const user = await user_service.getUserByEmail(data.email);
	id = user.id;
})

var count = 0
afterEach(async function() {
	count += 1
	if (count <= 4) {
		await user_service.deleteUser(id);
	}
})

test("0 day pass don't delete User account", async function() {
	await user_service.softDeleteUser(id, "USER", setDate(0));
	await cron.runCleanupLogic();
	const afterDeleteUser = await user_service.getUserById(id)

	expect(afterDeleteUser).not.toBeNull();
	expect(afterDeleteUser.isActive).toBe(false)
})

test("1 day pass don't delete User account", async function() {
	await user_service.softDeleteUser(id, "USER", setDate(1));
	await cron.runCleanupLogic();

	const afterDeleteUser = await user_service.getUserById(id)
	expect(afterDeleteUser).not.toBeNull();
	expect(afterDeleteUser.isActive).toBe(false)
})

test("45 day pass don't delete User account", async function() {
	await user_service.softDeleteUser(id, "USER", setDate(45));
	await cron.runCleanupLogic();

	const afterDeleteUser = await user_service.getUserById(id)
	expect(afterDeleteUser).not.toBeNull();
	expect(afterDeleteUser.isActive).toBe(false)
})
test("89 day pass don't delete User account", async function() {
	await user_service.softDeleteUser(id, "USER", setDate(89));
	await cron.runCleanupLogic();

	const afterDeleteUser = await user_service.getUserById(id)
	expect(afterDeleteUser).not.toBeNull();
	expect(afterDeleteUser.isActive).toBe(false)
})
test("90 day pass delete User account", async function() {
	await user_service.softDeleteUser(id, "USER", setDate(90));
	await cron.runCleanupLogic();

	await expect(user_service.getUserById(id)).rejects.toThrow();
})
