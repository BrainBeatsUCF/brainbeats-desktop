import axios from 'axios'
import { VerifiedUserInfo } from './authRequestService'
import { ResultStatus } from './requestService'
import {
  GridBeatObject,
  GridSampleObject,
  EncodedBeatObject,
  DecodableBeatObject,
  decodeBeatObject,
} from '../panel/workstationPanel/gridObjects'

const mockNetworkDelayMillisecond = 2000

/// Request Keys
const idKey = 'id'
const emailKey = 'email'
const nameKey = 'name'
const privacyKey = 'isPrivate'
const instrumentListKey = 'instrumentList'
const attributesKey = 'attributes'
const durationKey = 'duration'
const audioKey = 'audio'
const imageKey = 'image'

/// Request APIs and Routes
const azureRouteKey = 'BRAINBEATS_AZURE_API_URL'
const createBeatRoute = '/beat/create_beat'
const updateBeatRoute = '/beat/update_beat'
const deleteBeatRoute = '/beat/delete_beat'
const getOwnedBeatRoute = '/user/get_owned_beats'

/**
 * @param {String} email
 * @param {Dict} responseData
 * @return {DecodableBeatObject}
 */
const ParseBeatVertex = (email, responseData) => {
  const firstObject = responseData[0]
  const properties = firstObject.properties
  return {
    email: email,
    id: firstObject.id,
    name: properties.name[0].value,
    isPrivate: properties.isPrivate[0].value === 'False' ? false : true,
    instrumentList: properties.instrumentList[0].value,
    attributes: properties.attributes[0].value,
    duration: properties.duration[0].value,
    audio: properties.audio[0].value,
    image: properties.image[0].value,
  }
}

/**
 * @param {String} email
 * @param {[Dict]} responseData
 * @return {[DecodableBeatObject]}
 */
const ParseBeatVertices = (email, responseData) => {
  return responseData.map(singleVertex => {
    const properties = singleVertex.properties
    return {
      email: email,
      id: singleVertex.id,
      name: properties.name[0].value,
      isPrivate: properties.isPrivate[0].value === 'False' ? false : true,
      instrumentList: properties.instrumentList[0].value,
      attributes: properties.attributes[0].value,
      duration: properties.duration[0].value,
      audio: properties.audio[0].value,
      image: properties.image[0].value,
    }
  })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {EncodedBeatObject} encodedBeatObject
 * @param {(progress: String) => void} onProgress
 * @param {(savedObject: GridBeatObject) => void} onComplete
 * @param {() => void} onError
 */
const RequestCreateBeat = (userInfo, encodedBeatObject, onProgress, onComplete, onError) => {
  /// Create form
  let formData = new FormData()
  formData.append(emailKey, encodedBeatObject.email)
  formData.append(nameKey, encodedBeatObject.name)
  formData.append(privacyKey, encodedBeatObject.isPrivate)
  formData.append(instrumentListKey, encodedBeatObject.instrumentList)
  formData.append(attributesKey, encodedBeatObject.attributes)
  formData.append(durationKey, `${encodedBeatObject.duration}`)
  formData.append(audioKey, encodedBeatObject.audio, encodedBeatObject.audio.name)
  formData.append(imageKey, encodedBeatObject.image, encodedBeatObject.image.name)

  /// Make request
  const url = window.process.env[azureRouteKey] + createBeatRoute
  axios
    .post(url, formData, {
      onUploadProgress(progressEvent) {
        const progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2)
        onProgress(`Upload Progress... ${progress}%`)
      },
      headers: {
        Authorization: `Bearer ${userInfo.authToken}`,
      },
    })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      if (responseData.length == undefined || responseData.length != 1) {
        onError()
      } else {
        const decodableBeatObject = ParseBeatVertex(encodedBeatObject.email, responseData)
        const savedBeatObject = decodeBeatObject(decodableBeatObject)
        console.log('OUTPUT BEAT:', savedBeatObject)
        onComplete(savedBeatObject)
      }
    })
    .catch(error => {
      console.error(error)
      onError()
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {EncodedBeatObject} encodedBeatObject
 * @param {(progress: String) => void} onProgress
 * @param {(savedObject: GridBeatObject) => void} onComplete
 * @param {() => void} onError
 */
const RequestUpdateBeat = (userInfo, encodedBeatObject, onProgress, onComplete, onError) => {
  /// Create form
  let formData = new FormData()
  formData.append(idKey, encodedBeatObject.id)
  formData.append(emailKey, encodedBeatObject.email)
  formData.append(nameKey, encodedBeatObject.name)
  formData.append(privacyKey, encodedBeatObject.isPrivate)
  formData.append(instrumentListKey, encodedBeatObject.instrumentList)
  formData.append(attributesKey, encodedBeatObject.attributes)
  formData.append(durationKey, `${encodedBeatObject.duration}`)

  /// possible for audio and/or image to be null when not being updated
  if (encodedBeatObject.audio != null || encodedBeatObject.audio != undefined) {
    formData.append(audioKey, encodedBeatObject.audio, encodedBeatObject.audio.name)
  }
  if (encodedBeatObject.image != null || encodedBeatObject.image != undefined) {
    formData.append(imageKey, encodedBeatObject.image, encodedBeatObject.image.name)
  }

  /// Make request
  const url = window.process.env[azureRouteKey] + updateBeatRoute
  axios
    .post(url, formData, {
      onUploadProgress(progressEvent) {
        const progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2)
        onProgress(`Upload Progress... ${progress}%`)
      },
      headers: {
        Authorization: `Bearer ${userInfo.authToken}`,
      },
    })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      if (responseData.length == undefined || responseData.length != 1) {
        onError()
      } else {
        const decodableBeatObject = ParseBeatVertex(encodedBeatObject.email, responseData)
        const savedBeatObject = decodeBeatObject(decodableBeatObject)
        onComplete(savedBeatObject)
      }
    })
    .catch(error => {
      console.error(error)
      onError()
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(savedObject: GridBeatObject) => void} onComplete
 * @param {() => void} onError
 */
const RequestGetOwnedBeats = (userInfo, onComplete, onError) => {
  const url = window.process.env[azureRouteKey] + getOwnedBeatRoute
  const requestBody = {
    email: userInfo.email,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onError()
      } else {
        return response.data
      }
    })
    .then(responseData => {
      const decodableBeatObjects = ParseBeatVertices(userInfo.email, responseData)
      const retrievedBeatObjects = decodableBeatObjects.map(decodableObject => decodeBeatObject(decodableObject))
      onComplete(retrievedBeatObjects)
    })
    .catch(error => {
      console.error(error)
      onError()
    })
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {GridBeatObject} beatObject
 * @param {(status: ResultStatus) => void} onComplete
 */
const RequestDeleteBeat = (userInfo, beatObject, onComplete) => {
  const url = window.process.env[azureRouteKey] + deleteBeatRoute
  const requestBody = {
    email: userInfo.email,
    id: beatObject.beatID,
  }
  axios
    .post(url, requestBody, { headers: { Authorization: `Bearer ${userInfo.authToken}` } })
    .then(response => {
      if (response.status !== 200) {
        onComplete(ResultStatus.Error)
      } else {
        onComplete(ResultStatus.Success)
      }
    })
    .catch(error => {
      console.error(error)
      onComplete(ResultStatus.Error)
    })
}

/**
 *
 * @param {VerifiedUserInfo} userInfo
 * @param {GridSampleObject} sampleObject
 * @param {(status: ResultStatus) => void} didCompleteRequest
 */
const RequestDeleteSample = (userInfo, sampleObject, didCompleteRequest) => {
  // placeholder for request handler
  setTimeout(() => {
    didCompleteRequest(ResultStatus.Success)
  }, mockNetworkDelayMillisecond)
}

export {
  RequestUpdateBeat,
  RequestCreateBeat,
  RequestDeleteBeat,
  RequestDeleteSample,
  RequestGetOwnedBeats,
  VerifiedUserInfo,
  ResultStatus,
}
