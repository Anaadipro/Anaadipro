import React from 'react'
import UserAddressCard from '@/components/user-profile/UserAddressCard'
import UserMetaCard from '@/components/user-profile/UserMetaCard'
import UserInfocard from '@/components/user-profile/UserInfoCard'
import NomineeDetails from '@/components/user-profile/NomineeDetails'

export default function page() {
    return (
        <>
            <div className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-200 dark:bg-gray-800 lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                    Applicant Information
                </h3>
                <div className="space-y-6">
                    <UserMetaCard />
                    <UserInfocard />
                    <UserAddressCard />
                    <NomineeDetails />
                </div>
            </div>
        </>
    )
}
