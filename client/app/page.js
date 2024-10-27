// app/page.js
'use client' // This should be at the top

import Navbar from './components/layouts/Navbar/Navbar'
import Breadcrumb from './components/Miscellaneous/BreadCrumb'
import Map from './components/Miscellaneous/Map'
import SpottedStrayCard from './components/cards/SpottedStrayCard'
import FeaturedStrays from './components/cards/FeaturedAnimals'
import Footer from './components/layouts/Footer'

export default function Home() {
    return (
        <div>
            <Navbar />
            {/*<Breadcrumb />*/}
            <Map />
            <SpottedStrayCard />
            <FeaturedStrays />
            <Footer />
        </div>
    )
}