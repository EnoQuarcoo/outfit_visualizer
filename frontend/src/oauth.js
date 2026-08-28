import { Capacitor } from '@capacitor/core'
import { supabase } from './SupabaseClient'
import { Browser } from '@capacitor/browser'
import { App } from '@capacitor/app'

//Handle authentication based off user platform 

export async function signInWithProvider(provider) {
  // 1. figure out: are we native or web?
  //Eno : i dont think we need to store in var. Or write an explicit line here. 
  // works in if else just fine (opinion)
    
  if (Capacitor.isNativePlatform()) {
    // native path:
    // call signInWithOAuth, but tell it not to auto-navigate,
    // and tell it where to come back to
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider : provider,
        options : {
            redirectTo : "fit.abrima.app://auth/callback", //Provider sends user here after they finish signing in
            skipBrowserRedirect: true, //Prevents supabase from opening google directly
            // Google silently reuses an existing session instead of showing
            // the account picker unless explicitly told to prompt for one.
            ...(provider === "google" && {
                queryParams: { prompt: "select_account" },
            }),
        }

    })

    if (error) {
      console.error(`Sign-in with ${provider} failed:`, error);
      return;
    }
    //take the URL it hands back, open it in the in-app browser
    const provider_url = data.url
    await Browser.open({url: provider_url})
  } else {
    // 2b. web path:
    //     - call signInWithOAuth the normal, plain way
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
    }});

    if (error) {
      console.error(`Sign-in with ${provider} failed:`, error);
      return;
    }
  }
}


export async function listenForAuthRedirect(){
  // set up a listener that fires whenever the app is opened via a URL
  
  App.addListener('appUrlOpen', async ({ url }) => {
    //exchange this url for a real session by getting the code from the querry string
    console.log("raw redirect url:", url)
    //get querry string
    const urlSearch = new URL(url)
    const params = urlSearch.searchParams;
    const sessionCode = params.get('code')
    console.log("the session code is ", sessionCode)

    //exchange code for session 
    const { data, error } = await supabase.auth.exchangeCodeForSession(sessionCode)

    if (error) {
      console.error(`Session retrieval failed:`, error);
      return;
    }


    // 2. close the in-app browser now that we're done with it
    await Browser.close()

  });
}