import React, { FunctionComponent, useEffect, useState } from 'react'

import Router from 'next/router'
import Link from 'next/link'

import { compareBedrockVersions } from '../lib/util'
import { TagsResponse } from '../lib/files'
import { BedrockVersions } from '../lib/versions'

type VersionChooserProps = {
  versions: BedrockVersions
  tags: TagsResponse
}

type ParsedUrlResponse = {
  major: string
  minor: string
}
const parseUrlQuery = (query: string, versions: BedrockVersions): ParsedUrlResponse => {
  const parts = query.split('/')

  let parsed: ParsedUrlResponse = { major: '', minor: '' }

  if (parts.length > 0 && versions[parts[0]]) {
    parsed['major'] = parts[0]
    if (parts.length > 1 && versions[parts[0]][parts[1]]) {
      parsed['minor'] = parts[1]
    }
  }

  return parsed
}

const VersionChooser: FunctionComponent<VersionChooserProps> = ({ versions, tags }) => {
  // set from query string if possible
  useEffect(() => {
    let parsedUrlQuery: ParsedUrlResponse = { major: '', minor: '' }

    const { query } = Router
    if (query && query.r && typeof query.r === 'string') {
      parsedUrlQuery = parseUrlQuery(query.r, versions)

      if (parsedUrlQuery.major) setMajor(parsedUrlQuery.major)
      if (parsedUrlQuery.minor) setMinor(parsedUrlQuery.minor)
    }
  }, [])

  const [ stableMajor, stableMinor ] = tags.stable

  const [ major, setMajor ] = useState(stableMajor)
  const [ minor, setMinor ] = useState(stableMinor)

  let files: string[] = []
  if (versions[major] && versions[major][minor]) {
    files = versions[major][minor]
  }

  const [ file, setFile ] = useState(files[0])

  let majorVersions = Object.keys(versions).sort(compareBedrockVersions)
  let minorVersions = Object.keys(versions[major]).sort(compareBedrockVersions)

  useEffect(() => {
    if (!minorVersions.includes(minor)) setMinor(minorVersions[0])
  }, [ major ])

  const link = `/docs/${major}/${minor}/${file}`

  const setBeta = () => {
    setMajor(tags.beta[0])
    setMinor(tags.beta[1])
  }

  const setStable = () => {
    setMajor(tags.stable[0])
    setMinor(tags.stable[1])
  }

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col xl:flex-row text-3xl lg:text-5xl bg-white border-gray-200 rounded-lg outline-none shadow shadow-sm hover:shadow-lg appearance-none hover:border-gray-300 transition duration-150 ease-in-out pl-3 pr-3 xl:pr-1 py-3 xl:py-1 rounded-lg font-extrabold'>
        <div className='flex flex-col xl:flex-row'>
          <span className='select-none'>bedrock.dev/docs/</span>
          <div className='flex flex-row items-center'>
            <select className='my-2 md:my-0 w-full' value={major} onChange={({ target: { value } }) => setMajor(value)}>
              {majorVersions.map((version) => <option key={`major-${version}`} value={version}>{version}</option>)}
            </select>
            <span className='select-none'>/</span>
          </div>
          <div className='flex flex-row items-center'>
            <select className='my-2 md:my-0 w-full' value={minor} onChange={({ target: { value } }) => setMinor(value)}>
              {minorVersions.map((version) => <option key={`minor-${version}`} value={version}>{version}</option>)}
            </select>
            <span className='select-none'>/</span>
          </div>
          <div className='flex flex-row items-center'>
            <select className='my-2 md:my-0 w-full' value={file} onChange={({ target: { value } }) => setFile(value)}>
              {files.map((file) => <option key={`file-${file}`} value={file}>{file}</option>)}
            </select>
          </div>

          <Link href={`/docs/[...slug]`} as={link}>
            {/*bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded*/}
            <a className='bg-white border border-black xl:border-none hover:bg-gray-100 transition transition-140 ease-in-out text-black font-semibold py-1 px-4 rounded-lg text-center mt-2 xl:mt-0 xl:ml-2'>
              Go
            </a>
          </Link>
        </div>
      </div>

      <div className='flex flex-row items-center justify-center text-xl xl:p-2 rounded-sm'>
        <button
          className='bg-white border border-gray-600 hover:border-black text-black font-bold py-1 px-4 rounded-md text-center mt-2'
          onClick={() => setBeta()}
        >
          Latest Beta
        </button>
        <button
          className='bg-white border border-gray-600 hover:border-black text-black font-bold py-1 px-4 rounded-md text-center mt-2 ml-2'
          onClick={() => setStable()}
        >
          Latest Release
        </button>
      </div>
    </div>
  )
}

export default VersionChooser
