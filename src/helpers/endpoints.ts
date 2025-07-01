 const endpoints =  {
    auth: {
        sendOtp: "auth/send-otp",
        verifyOtp: "auth/verify-otp",
        googleLogin: "auth/google-login"
    },
    profile: {
        getProfileInfo: "user/profile",
        updateProfile: "user/update-profile"
    },
    product: {
        getProducts: "product/list",
        getProductSkuList: "product/sku-list",
        getCountries: "location/countries",
        getStates: (countryId: string) => `location/states?country_id=${countryId}`,
        placeOrder: "order/purchase",
        extractOrder: "chatgpt/extract-order"
    }
}
export default endpoints;