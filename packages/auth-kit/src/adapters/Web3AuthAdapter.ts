import { CHAIN_NAMESPACES,WALLET_ADAPTERS } from '@web3auth/base'
import { Web3Auth } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { ExternalProvider } from '@ethersproject/providers'

import type { SafeAuthClient, Web3AuthProviderConfig } from '../types'

/**
 * Web3AuthAdapter implements the SafeAuthClient interface for adapting the Web3Auth service provider
 * @class
 */
export default class Web3AuthAdapter implements SafeAuthClient {
  provider: ExternalProvider | null
  private chainId: string
  private web3authInstance?: Web3Auth
  private config: Web3AuthProviderConfig

  /**
   *
   * @param chainId Chain Id
   * @param config Web3Auth configuration
   */
  constructor(chainId: string, config: Web3AuthProviderConfig) {
    this.config = config
    this.chainId = chainId
    this.provider = null
  }

  /**
   * Initialize the Web3Auth service provider {@link https://web3auth.io/docs/sdk/web/modal/initialize}
   * @throws Error if there was an error initializing Web3Auth
   */
  async init() {

      const web3auth = new Web3Auth({
        clientId: this.config.clientId,
        web3AuthNetwork: this.config.network,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: this.chainId,
          rpcTarget: this.config.rpcTarget
        },
        uiConfig: {
          theme: this.config.theme,
          loginMethodsOrder: ['google', 'facebook']
        }
      })

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'none'
        },
        adapterSettings: {
          uxMode: 'popup',
          whiteLabel: {
            name: 'Safe'
          }
        }
      })

      web3auth.configureAdapter(openloginAdapter)

      await web3auth.initModal({
        modalConfig: {
          [WALLET_ADAPTERS.OPENLOGIN]: {
            label: "openlogin",
             showOnModal: true,
          },
          [WALLET_ADAPTERS.WALLET_CONNECT_V1]: {
            label:"walletconnectv1",
            showOnModal: true,
          },
          [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
            label:"walletconnectv2",
            showOnModal: true,
          },
          [WALLET_ADAPTERS.TORUS_EVM]: {
            label:"walletconnectv1",
            showOnModal: false,
            showOnDesktop:false,
            showOnMobile:false
          },
          [WALLET_ADAPTERS.METAMASK]: {
            label:"metamask",
            showOnModal: true,
          },
          [WALLET_ADAPTERS.COINBASE]: {
            label:"coinbase",
            showOnModal: true,
          },
        },
      })

      this.provider = web3auth.provider
      this.web3authInstance = web3auth
    
  }

  /**
   * Connect to the Web3Auth service provider
   * @returns
   */
  async signIn(): Promise<void> {
    if (!this.web3authInstance) return

    this.provider = await this.web3authInstance.connect()
  }

  /**
   * Disconnect from the Web3Auth service provider
   */
  async signOut(): Promise<void> {
    if (!this.web3authInstance) return

    return await this.web3authInstance?.logout()
  }
}
