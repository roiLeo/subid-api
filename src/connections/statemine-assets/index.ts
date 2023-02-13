type Asset = {
  assetId: number
  icon?: string
}

type Assets = Record<string, Asset>

export const assetByName: Assets = {
  rmrk: {
    assetId: 8,
    icon: 'rmrk.jpg'
  },
  chaos: {
    assetId: 69420,
    icon: 'chaos.png'
  },
  CHRWNA: {
    assetId: 567,
    icon: 'CHRWNA.png'
  },
  shibatales: {
    assetId: 88888,
    icon: 'shibatales.png'
  },
  billcoins: {
    assetId: 223,
    icon: 'Billcoin.svg'
  },
  polaris: {
    assetId: 16,
    icon: 'aris.svg'
  }
}

export const assets = Object.values(assetByName)
