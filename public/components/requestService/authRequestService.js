import hash from 'object-hash'

const fakeNetworkDelayMilliseconds = 1250

const fakeAcceptedUsers = [
	{
		UserEmail: 'test@test.com',
		UserPassword: '1234',
	},
]

const ResultStatus = {
	Success: 'success',
	Error: 'error',
}

const ResultStatusErrorMessage = {
	NON_EXISTENT_USER_ERROR_MESSAGE: 'User email or password invalid',
	INVALID_REGISTRATION_DATA: 'User email or password cannot be registered',
	USER_ALREADY_EXISTS: 'Email already exists, please log in',
}

/**
 * @param {String} email
 * @param {String} password
 */
const AuthenticateUserInfo = (email, password) => {
	return {
		UserEmail: email,
		UserPassword: password,
	}
}

/**
 * This object holds the session info for the authenticated user
 */
const VerifiedUserInfo = {
	email: '',
	authCode: '',
	uuid: '',
}

/**
 * @param {{
 * UserEmail: String,
 * UserPassword: String,
 * }} userInfo
 * @param {(user: VerifiedUserInfo, status: String, message: String) => void} didCompleteRequest
 */
const RequestUserLoginAuthentication = (userInfo, didCompleteRequest) => {
	setTimeout(() => {
		for (let user in fakeAcceptedUsers) {
			const fakeUser = fakeAcceptedUsers[user]
			if (fakeUser.UserEmail == userInfo.UserEmail && fakeUser.UserPassword == userInfo.UserPassword) {
				didCompleteRequest(
					{
						email: userInfo.UserEmail,
						authCode: userInfo.UserEmail.repeat(2),
						uuid: hash.sha1(userInfo.UserEmail),
					},
					ResultStatus.Success,
					null
				)
				return
			}
			didCompleteRequest(
				{
					email: null,
					authCode: null,
					uuid: null,
				},
				ResultStatus.Error,
				ResultStatusErrorMessage.NON_EXISTENT_USER_ERROR_MESSAGE
			)
			return
		}
	}, fakeNetworkDelayMilliseconds)
}

/**
 * @param {{
 * UserEmail: String,
 * UserPassword: String,
 * }} userInfo
 * @param {(user: VerifiedUserInfo, status: String, message: String) => void} didCompleteRequest
 */
const RequestUserRegisterAuthentication = (userInfo, didCompleteRequest) => {
	setTimeout(() => {
		if (userInfo.UserEmail.length === 0 || userInfo.UserPassword.length === 0) {
			didCompleteRequest(
				{
					email: null,
					authCode: null,
					uuid: null,
				},
				ResultStatus.Error,
				ResultStatusErrorMessage.INVALID_REGISTRATION_DATA
			)
			return
		}

		let userAlreadyExists = false
		for (let user in fakeAcceptedUsers) {
			const fakeUser = fakeAcceptedUsers[user]
			if (fakeUser.UserEmail == userInfo.UserEmail) {
				userAlreadyExists = true
				break
			}
		}

		if (userAlreadyExists) {
			didCompleteRequest(
				{
					email: null,
					authCode: null,
					uuid: null,
				},
				ResultStatus.Error,
				ResultStatusErrorMessage.USER_ALREADY_EXISTS
			)
			return
		}

		const newUser = {
			UserEmail: userInfo.UserEmail,
			UserPassword: userInfo.UserPassword,
		}
		fakeAcceptedUsers.push(newUser)
		didCompleteRequest(
			{
				email: userInfo.UserEmail,
				authCode: userInfo.UserEmail.repeat(2),
				uuid: hash.sha1(userInfo.UserEmail),
			},
			ResultStatus.Success,
			null
		)
		return
	}, fakeNetworkDelayMilliseconds)
}

export {
	RequestUserLoginAuthentication,
	RequestUserRegisterAuthentication,
	AuthenticateUserInfo,
	VerifiedUserInfo,
	ResultStatus,
}
