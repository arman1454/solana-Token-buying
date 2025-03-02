import React, {useState} from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import {HomeView,
  ToolView,
  FeaturesView,
  OfferView,
  FaqView,
  CreateView,
  TokenMetadata,
  ContactView, 
  AirdropView,
  DonateView,
  } from 'views'

const Home: NextPage = (Props) => {
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openTokenMetadata, setOpenTokenMetadata] = useState(false)
  const [openContact, setOpenContact] = useState(false)
  const [openAirDrop, setOpenAirDrop] = useState(false)
  const [openSendTransaction, setOpenSendTransaction] = useState(false)

  return(
    <>
    <Head>
      <title>Solana Token Creator</title>
      <meta name = "Solana token creator" content='Build and create solana token'/>
      </Head>
      <HomeView setOpenCreateModal = {setOpenCreateModal}/>
       <ToolView
      setOpenAirDrop = {setOpenAirDrop}
      setOpenContract = {setOpenContact}
      setOpenCreateModal = {setOpenCreateModal}
      setOpenSendTransaction = {setOpenSendTransaction}
      setOpenTokenMetadata = {setOpenTokenMetadata}
      />

      <FeaturesView setOpenAirDrop={setOpenAirDrop}
          setOpenContact={setOpenContact}
          setOpenCreateModal={setOpenCreateModal}
          setOpenSendTransaction={setOpenSendTransaction}
          setOpenTokenMetadata={setOpenTokenMetadata} />

      {/*<OfferView/>
          <FaqView/>

          {
            openCreateModal && (
              <div className='new_loader relative h-full bg-slate-900'>
                <CreateView setOpenCreateModal={setOpenCreateModal}/>
              </div>
            )
          }
          {
            openTokenMetadata && (
              <div className='new_loader relative h-full bg-slate-900'>
                <TokenMetadata setOpenTokenMetadata={setOpenTokenMetadata}/>
              </div>
            )
          }
          {
            openContact && (
              <div className='new_loader relative h-full bg-slate-900'>
                <ContactView setOpenContact={setOpenContact}/>
              </div>
            )
          }
          {
            openAirDrop && (
              <div className='new_loader relative h-full bg-slate-900'>
                <AirdropView setOpenAirDrop={setOpenAirDrop}/>
              </div>
            )
          }
          {
            openSendTransaction && (
              <div className='new_loader relative h-full bg-slate-900'>
                <DonateView setOpenSendTransaction={setOpenSendTransaction}/>
              </div>
            )
          } */}

          
    
    </>
  )

}

export default Home
