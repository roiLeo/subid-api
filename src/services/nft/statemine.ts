import { ApiPromise } from '@polkadot/api'
import { StorageKey, Option } from '@polkadot/types'
import {
  AccountId,
  InstanceId,
  InstanceDetails,
  ClassDetails,
  InstanceMetadata,
  ClassMetadata
} from '@polkadot/types/interfaces'
import { hexToString } from '@polkadot/util'
import { parseStatemineNfts } from './utils'

export const getStatemineNftsByAccount = async (polkadotUniquesApi: ApiPromise, accountId: string) => {
  const nftAssets: [StorageKey<[AccountId, InstanceId]>, Option<InstanceDetails>][] =
    await polkadotUniquesApi.query.uniques.account.entries(accountId)

  const promises = nftAssets.map(async (nftAsset): Promise<any> => {
    const classId = nftAsset[0].args[1].toString()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const assetId = nftAsset[0].args[2].toString()
    const sn = nftAsset[0].args[1].toNumber() + 1
    const assetData = (nftAsset[1] as Option<InstanceDetails>).toJSON()

    const classInstance = await polkadotUniquesApi.query.uniques.class(classId)
    const classData: ClassDetails = classInstance.toJSON() as unknown as ClassDetails

    const metadataRaw = await polkadotUniquesApi.query.uniques.instanceMetadataOf(classId, assetId)
    const metadata: InstanceMetadata = polkadotUniquesApi.registry.createType(
      'InstanceMetadata',
      (metadataRaw as Option<InstanceMetadata>).toHex()
    )

    const classMetadataRaw = await polkadotUniquesApi.query.uniques.classMetadataOf(classId)
    const classMetadata: ClassMetadata = polkadotUniquesApi.registry.createType(
      'ClassMetadata',
      (classMetadataRaw as Option<ClassMetadata>).toHex()
    )
    const classIpfsCid = hexToString(classMetadata.data.toString())
    const ipfsCid = hexToString(metadata.data.toString())

    const cid = ipfsCid || classIpfsCid

    return {
      ...(assetData as unknown as InstanceDetails),
      id: assetId,
      sn: sn.toString().padStart(8, '0'),
      collection: {
        max: Number(classData.instances),
        id: classId
      },
      metadata: cid ? `ipfs://ipfs/${cid}` : '',
      idForLink: `${classId}/${assetId}`
    }
  })

  const statemineNfts = await Promise.all(promises)

  return parseStatemineNfts(statemineNfts, 'statemine.svg')
}
