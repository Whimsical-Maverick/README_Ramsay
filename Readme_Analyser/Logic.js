const form = document.querySelector('#form')
const out = document.querySelector('#output')
const MODEL_ID = 'gemini-1.5-flash'
const GENERATE_CONTENT_API = 'generateContent'
const GEMINI_API_KEY = ''//add your gemini api key here
function callgemini(decoded){
    const prompt = `You're a mean but hilarious senior code reviewer who's absolutely fed up with garbage README files.
                    Take this README and do the following:
                    1.Give it a brutally honest score out of 10.
                    2.Roast it mercilessly – be sarcastic, use emojis, make clever and funny jabs, like you're roasting it in front of a tech comedy roast panel.
                    3.Point out exactly what's wrong or missing – like documentation, clarity, structure, usage instructions, or any "WTF is this?" moments.
                    4.Comment on the writing style – with at least one sarcastic observation, something like:“Wow, this sentence structure is as stable as my internet during Zoom calls.”
                    BONUS: Suggest a glow-up version of one section (like the intro or usage part) that would actually make you not want to cry.
                    Tone: Think Gordon Ramsay reviews GitHub, but for tech.

Here's the README:
${decoded}`
    fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}`,{
        method:'POST',
        headers:{
            'Accept':'application/json',
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            contents:[
                {
                    role:'user',
                    parts:[{
                        text : `${prompt}`
                    }]
                },
            ],
            
        })
    })
    .then(res => res.json())
    .then(data => {
            const response = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
            out.value = response;
            })
    .catch(err => {
            out.value = `Gemini Error: ${err}`;
    })
}
form.addEventListener('submit',(e)=>{
e.preventDefault()
const input = document.querySelector('#input')
const url = new URL(input.value)
const parts = url.pathname.split('/')
const user = parts[1]
const repo = parts[2]
fetch(`https://api.github.com/repos/${user}/${repo}/contents/README.md`,{
    method:"GET",
    headers:{
    'Accept':'application/vnd.github+json',
}})
.then((response) => {
    if(!response.ok)
    {
        throw new Error(response.status)
    }
    else{
        return response.json()
    }
})
.then((data)=>{
    const cleanedBase64 = data.content.replace(/\n/g, '');
    const decoded = atob(cleanedBase64)//decoding the encoded readme
    const html_output = marked.parse(decoded)
    callgemini(html_output)
})
.catch((err)=>{
    out.innerHTML=err
})

})
