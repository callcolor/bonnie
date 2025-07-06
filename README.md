A Second Life bot enabling text-to-speech applications.

Let us know which "Bonnie" features you'd like us to release next!

# Running your own Bonnie (TTS) instance

Sign up for Second Life.  
Account with free sound clip uploads highly recommended!  
https://join.secondlife.com/

Install Podman.  
https://podman.io/docs/installation

Setup Podman Compose.  
https://stackoverflow.com/a/78396855

Copy the example config file and edit it to your needs.  
`cp config.example.ts config.ts`

Start a postgres database with Podman.  
`podman compose up -d`

Build and run the Bonnie application.  
`podman build -t bonnie .`
`podman run --name bonnie bonnie`

# Create the in-world Script

1. Copy the contents of ./LSL/text-to-speech.lsl into a new script.  
1. Replace the bonnieBelle86 value with your bot UUID.  
1. Replace the secret value with the value you created in config.ts.  
1. Speak in local chat.  

# Teardown

Remove the container.  
`podman rm -f bonnie`
