import React, {FC, useCallback, useState} from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {Keypair, PublicKey, SystemProgram, Transaction} from '@solana/web3.js'
import {MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMintInstruction,
   getMinimumBalanceForRentExemptMint, 
   getAssociatedTokenAddress, createMintToInstruction, createAssociatedTokenAccountInstruction} from "@solana/spl-token"
import { PROGRAM_ID, createCreateMetadataAccountV3Instruction, createCreateMetadataAccountInstruction } from '@metaplex-foundation/mpl-token-metadata'
import axios from "axios"
import { notify } from 'utils/notifications'
import { ClipLoader } from 'react-spinners'
import { useNetworkConfiguration } from 'contexts/NetworkConfigurationProvider'
import {AiOutlineClose} from 'react-icons/ai'
import CreateSVG from 'components/SVG/CreateSVG'
import { set } from 'immer/dist/internal'
import { InputView } from 'views'
// import Branding from 'components/Branding'
// import { InputView } from 'views'

export const CreateView : FC = ({setOpenCreateModal}) => {
  const {connection} = useConnection()
  const {publicKey, sendTransaction} = useWallet()
  const {networkConfiguration} = useNetworkConfiguration()
  const [tokenUri, setTokenUri] = useState("")
  const [tokenMintAddress, setTokenMintAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [token,setToken] = useState({
    name:"",
    symbol:"",
    decimals:"",
    amount:"",
    image:"",
    description:""
  })

  const handleFormFieldChange = (fieldName,e)=>{
    setToken({...token, [fieldName]: e.target.value})
  }

  const createToken = useCallback(async(token)=>{
    const lamports = await getMinimumBalanceForRentExemptMint(connection)
    const mintKeypair = Keypair.generate()
    const tokenAtA = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey)

    try {
      const metadataUrl = await uploadMetadata(token)
      console.log(metadataUrl);
      const createMetadataInstruction = createCreateMetadataAccountV3Instruction({
        metadata: PublicKey.findProgramAddressSync([Buffer.from("metadata"), PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],PROGRAM_ID)[0],mint:mintKeypair.publicKey,mintAuthority:publicKey,payer:publicKey,updateAuthority:publicKey}
        ,{
        createMetadataAccountArgsV3:{
          data:{
            name:token.name,
            symbol:token.symbol,
            uri:metadataUrl,
            creators:null,
            sellerFeeBasisPoints:0,
            uses:null,
            collection:null
          },
          isMutable:false,
          collectionDetails:null
        },
      })

      const createNewTokenTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: lamports,
          programId: TOKEN_PROGRAM_ID
        }),
        createInitializeMintInstruction(mintKeypair.publicKey,Number(token.decimals),publicKey,publicKey,TOKEN_PROGRAM_ID),
        createAssociatedTokenAccountInstruction(publicKey,tokenAtA,publicKey,mintKeypair.publicKey),
        createMintToInstruction(mintKeypair.publicKey,tokenAtA,publicKey,Number(token.amount) * Math.pow(10,Number(token.decimals))),
        createMetadataInstruction
      )
      const signature = await sendTransaction(createNewTokenTransaction,
        connection,{
          signers:[mintKeypair],
        }
      )
      setTokenMintAddress(mintKeypair.publicKey.toString())
      notify({
        type: "success",
        message: "Token created successfully", txid: signature})   
    } catch (error:any) {
      notify({
        message: "Token creation failed",
        type: "error"
      })
    }
    setIsLoading(false)
  }, [publicKey, connection, sendTransaction])  

  const handleImageChange = async(event)=>{
    const file = event.target.files[0]

    if(file){
      const imgUrl = await uploadImagePinata(file)
      setToken({...token, image: imgUrl})
    }
  }

  const uploadImagePinata = async(file)=>{
    if(file){
      try {
        const formData = new FormData();
        formData.append("file", file)
        const response = await axios({
          method: "POST",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: "c49f8d981b609ddacd45",
            pinata_secret_api_key: "b03e8d294fa8a07f26e8a04680f51f1660ba468a66b10e36163214791c241bc8",
            "Content-Type": "multipart/form-data"
        }})
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash        
      } catch (error) {
        notify({
          message: "Upload to pinata failed",
          type: "error"
        })
        
      }

      setIsLoading(false)
    }
  }

  const uploadMetadata = async(token)=>{
    setIsLoading(true);
    const {name, symbol, description, image} = token;
    if(!name || !symbol || !description || !image){
      notify({
        message: "Please fill in all fields",
        type: "error"
      })
      return
    }

    const data = JSON.stringify({
      name:name,
      symbol:symbol,
      description:description,
      image:image
    })

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: "c49f8d981b609ddacd45",
          pinata_secret_api_key: "b03e8d294fa8a07f26e8a04680f51f1660ba468a66b10e36163214791c241bc8",
          "Content-Type": "application/json"
        }
      })
      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      return url
    } catch (error:any) {
      notify({
        message: "Upload to Json failed",
        type: "error"
      })
    }
    setIsLoading(false)
  }

  return (
    <>
    {
      isLoading && (
        <div className='absolute top-0 left-0 z-50 flex h-screen w-full items-center justify-center bg-black/[.3] backdrop-blur-[10px]'>
          <ClipLoader/>
        </div>
      )
    }

    {
      !tokenMintAddress ? (
      <section className='flex w-full items-center py-6 px-0 lg:h-screen lg:p-10'>
        <div className="container">
          <div className='bg-default-950/40 mx-auto max-w-5xl overflow-hidden rounded-2xl backdrop-blur-2xl'>
            <div className='grid gap-10 lg:grid-cols-2'>
              <div className='ps-4 hidden py-4 pt-10 lg:block'>
                <div className='upload relative w-full overflow-hidden rounded-xl'>
                  {
                    token.image?(
                      <img src={token.image} alt="token" className='w-2/5' />
                    ):(
                      <label htmlFor="file" className='custom-file-upload'>
                        <div className='icon'>
                          <CreateSVG/>
                        </div>
                        <div className='text'>
                          <span>Click to Upload Image</span>
                        </div>
                        <input type="file" id='file' onChange={handleImageChange} />
                      </label>
                    )
                  }
                </div>
                <textarea rows="6" onChange={(e)=> handleFormFieldChange("description",e)} className='border-default-200 relative mt-48 block w-full rounded border-white/10 bg-transparent py-1.5 px-3
                 text-white/80 focus:border-white/25 focus:ring-transparent' placeholder='Description of your token'></textarea>
              </div>
              <div className="lg:ps-0 flex flex-col p-10">
                <div className='pb-6 my-auto'>
                  <h4 className='mb-4 text-2xl font-bold text-white'>
                    Solana Token Creator
                  </h4>
                  <p className='text-default-300 mb-8 max-w-sm'>
                    Kindly Provide All the Details About Your Token
                  </p>

                  <div className='text-start'>
                    <InputView name="Name" placeholder="name" clickhandle = {(e)=>handleFormFieldChange("name",e)}/>
                    <InputView name="Symbol" placeholder="symbol" clickhandle = {(e)=>handleFormFieldChange("symbol",e)}/>
                    <InputView name="Decimals" placeholder="decimals" clickhandle = {(e)=>handleFormFieldChange("decimals",e)}/>
                    <InputView name="Amount" placeholder="amount" clickhandle = {(e)=>handleFormFieldChange("amount",e)}/>
                    <div className='mb-6 text-center'>
                        <button type='submit' onClick={()=>createToken(token)} className='bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500'>
                          <span className='fw-bold'>Create Token</span>
                        </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className='text-center'>
                    <ul className='flex flex-wrap items-center justify-center gap-2'>
                      <li>
                        <a onClick={()=> setOpenCreateModal(false)} className='group inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-2xl transition-all duration-500 hover:bg-blue-600/60'>
                          <i className='text-2xl text-white group-hover:text-white'>
                            <AiOutlineClose/>
                          </i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>  
      ):""
    }
    </>
  )
}
