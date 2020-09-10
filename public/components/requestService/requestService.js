import trianglify from 'trianglify'
import secondTestDataSet from './testHomeData2.json'
import testSampleData from './testSampleObject.json'
import { VerifiedUserInfo } from './authRequestService'
import { ListObjectType } from '../panel/verticalListPanel/verticalListPanel'
import { GridSampleObject } from '../panel/workstationPanel/gridComponents'

const mockNetworkDelayMillisecond = 2000
const mockRandomListCountMaximum = 20

const ResultStatus = {
  Success: 'success',
  Error: 'error',
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(data: any, status: String) => void} didCompleteRequest
 */
const RequestHomeData = (userInfo, didCompleteRequest) => {
  setTimeout(() => {
    console.log(userInfo)
    didCompleteRequest(secondTestDataSet, ResultStatus.Success)
  }, 2500)
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(data: [GridSampleObject]) => void} didCompleteRequest
 */
const RequestUserSampleItems = (userInfo, didCompleteRequest) => {
  setTimeout(() => {
    const oneObject = testSampleData
    let somelist = []
    const maxCount = Math.floor(Math.random() * Math.floor(mockRandomListCountMaximum))
    for (let i = 0; i < maxCount; i++) {
      let newObject = {}
      Object.assign(newObject, oneObject)
      somelist.push(newObject)
    }
    console.log(userInfo)
    didCompleteRequest(somelist)
  }, mockNetworkDelayMillisecond)
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @param {(data: [any]) => void} didCompleteRequest
 */
const RequestUserBeatItems = (userInfo, didCompleteRequest) => {
  setTimeout(() => {
    const oneObject = {
      sampleSource: '',
      sampleTitle: 'Some Title',
      sampleSubtitle: 'Some subtitle',
      sampleIsActive: true,
      sampleRowIndex: 0,
      sampleColIndex: 0,
      samplePlayLength: 1,
      type: ListObjectType.Sample,
      attributes: null,
    }
    let somelist = []
    const maxCount = Math.floor(Math.random() * Math.floor(mockRandomListCountMaximum))
    for (let i = 0; i < maxCount; i++) {
      let newObject = {}
      Object.assign(newObject, oneObject)
      somelist.push(oneObject)
    }
    console.log(userInfo)
    didCompleteRequest(somelist)
  }, mockNetworkDelayMillisecond)
}

/**
 * @param {VerifiedUserInfo} userInfo
 * @return {String}
 */
const RequestUserProfileImage = userInfo => {
  console.log(userInfo.email)
  const options = {
    height: 120,
    width: 120,
    cellSize: 25,
    seed: userInfo.uuid,
  }
  const pattern = trianglify(options)
  return pattern.toCanvas().toDataURL()
}

export { RequestHomeData, RequestUserProfileImage, RequestUserBeatItems, RequestUserSampleItems, ResultStatus }
