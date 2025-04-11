import { component$, useSignal, useStore, useStylesScoped$, useVisibleTask$, $, QRL, Slot, noSerialize } from '@builder.io/qwik';
import { routeLoader$, server$, Form, routeAction$, zod$, z } from '@builder.io/qwik-city';
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
// Removed unused useAuthSession import
import { tursoClient } from '~/utils/turso'; // Assuming turso client setup

// --- Interfaces ---
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FormValues {
  userResponse: string;
  language: string;
}

interface VoiceSettings {
  type: string;
  voice_id: string;
}

// --- Constants ---
const DID_API_URL = import.meta.env.DID_API_URL || "https://api.d-id.com";
// No usamos estas constantes pues usamos server$ para acceder a las claves
// const DID_API_KEY = import.meta.env.DID_API_KEY;
// const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;

const languages = [
  { value: "en-US", label: "English" },
  { value: "es-ES", label: "Spanish" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-BR", label: "Portuguese" },
];

const languageMap: Record<string, string> = {
  'en-US': 'English',
  'es-ES': 'Spanish',
  'it-IT': 'Italian',
  'pt-BR': 'Portuguese'
};

const voiceMap: Record<string, VoiceSettings> = {
  'en-US': { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
  'es-ES': { type: 'microsoft', voice_id: 'es-ES-AbrilNeural' },
  'it-IT': { type: 'microsoft', voice_id: 'it-IT-IsabellaNeural' },
  'pt-BR': { type: 'microsoft', voice_id: 'pt-BR-BrendaNeural' }
};

// --- Helper Functions ---
const getVoiceSettings = (languageCode: string): VoiceSettings => {
  return voiceMap[languageCode] || voiceMap['en-US']; // Default to English
};

const formatRecordingTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const processTextForVoice = (text: string): string => {
    if (!text) return "";
    let processed = text.replace(/\*\*([^*]+)\*\*/g, "$1");
    processed = processed.replace(/\*([^*]+)\*/g, "$1");
    processed = processed.replace(/~~([^~]+)~~/g, "$1");
    processed = processed.replace(/`([^`]+)`/g, "$1");
    processed = processed.replace(/```[a-z]*\n([\s\S]*?)```/g, "code block omitted");
    processed = processed.replace(/^#{1,6}\s+(.+)$/gm, "$1");
    processed = processed.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    processed = processed.replace(/https?:\/\/\S+/g, "URL");
    processed = processed.replace(/www\.\S+/g, "URL");
    processed = processed.replace(/\n\s*[-•*+]\s*/g, ", ");
    processed = processed.replace(/\n/g, " ");
    processed = processed.replace(/[#_~<>{}|]/g, "");
    processed = processed.replace(/&[a-z]+;/g, " ");
    processed = processed.replace(/["']([^"']+)["']/g, "$1");
    processed = processed.replace(/\s+/g, " ").trim();
    return processed;
};

// --- Server Functions ---

// IMPORTANT: Replace placeholder API keys with secure server-side access
// (e.g., using requestEv.env.get('DID_SECRET_KEY'))

const getAuthHeader = server$(function() {
    // Fetch the actual key securely on the server
    const apiKey = this.env.get('DID_API_KEY') || import.meta.env.DID_API_KEY; // Use the environment variable you have
    if (!apiKey) {
        console.error("D-ID API Key is not configured on the server.");
        return ''; // Or throw error
    }
    return `Basic ${apiKey}`;
});

const fetchWithRetries = server$(async function(url: string, options: RequestInit, retries = 0): Promise<Response> {
    const MAX_RETRY_COUNT = 3;
    const MAX_DELAY_SEC = 4;
    try {
        console.log(`Server Fetch: Making request to: ${url}`, { method: options.method });
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Server Fetch: Request failed status ${response.status}: ${errorText}`);

            if (response.status === 401 || response.status === 403) {
                console.error('Server Fetch: Authentication failed. Check D-ID API key.');
                throw new Error(`Authentication failed: ${response.status}`);
            }

            if (retries < MAX_RETRY_COUNT) {
                const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), MAX_DELAY_SEC) * 3000;
                console.log(`Server Fetch: Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                // Note: 'this' context might be lost here if not careful. Re-invoking server$ might be needed.
                // For simplicity, direct recursion is shown, but consider implications.
                return fetchWithRetries(url, options, retries + 1);
            }
            throw new Error(`Server Fetch: Request failed status: ${response.status}`);
        }
        return response; // Return the raw Response object
    } catch (error: any) {
        if (retries < MAX_RETRY_COUNT) {
            const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), MAX_DELAY_SEC) * 3000;
            console.log(`Server Fetch: Request error: ${error.message}, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetries(url, options, retries + 1);
        }
        console.error('Server Fetch: Max retries exceeded:', error);
        throw error;
    }
});


const serverInitConnection = server$(async function() {
    console.log("Server: Step 1: Creating a new stream");
    const authHeader = await getAuthHeader();
    if (!authHeader) throw new Error("Server Auth Header failed");

    const response = await fetchWithRetries(`${DID_API_URL}/talks/streams`, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            source_url: "https://i.postimg.cc/fLdQq0DW/thumbnail.jpg", // Replace with your avatar image URL if needed
        }),
    });
    const data = await response.json();
    console.log("Server: Stream creation response:", data);
    if (!data.id || !data.session_id) {
        throw new Error("Server: Stream ID or Session ID missing");
    }
    return {
        streamId: data.id,
        offer: data.offer || data.jsep, // Handle potential variations
        iceServers: data.ice_servers,
        sessionId: data.session_id,
    };
});

const serverSendSdpAnswer = server$(async function(streamId: string, sessionId: string, answer: RTCSessionDescriptionInit) {
    console.log("Server: Step 3: Sending SDP answer");
    const authHeader = await getAuthHeader();
     if (!authHeader) throw new Error("Server Auth Header failed");

    const response = await fetchWithRetries(`${DID_API_URL}/talks/streams/${streamId}/sdp`, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            answer: answer,
            session_id: sessionId
        })
    });
    if (!response.ok) {
        throw new Error(`Server: SDP response error: ${response.status}`);
    }
    console.log("Server: SDP answer sent successfully");
    return await response.json(); // Or just return success status
});

const serverSendIceCandidate = server$(async function(streamId: string, sessionId: string, candidateData: any) {
    console.log("Server: Sending ICE candidate");
     const authHeader = await getAuthHeader();
     if (!authHeader) throw new Error("Server Auth Header failed");

    const response = await fetchWithRetries(`${DID_API_URL}/talks/streams/${streamId}/ice`, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...candidateData,
            session_id: sessionId,
        }),
    });
     if (!response.ok) {
        console.error(`Server: Failed to send ICE candidate: ${response.status}`);
        // Don't throw here, as ICE failures can sometimes be recovered
    } else {
        console.log('Server: ICE candidate sent successfully');
    }
});


const serverCreateTalk = server$(async function(text: string, voiceSettings: VoiceSettings, streamId: string, sessionId: string) {
    console.log("Server: Step 4: Creating a talk");
     const authHeader = await getAuthHeader();
     if (!authHeader) throw new Error("Server Auth Header failed");

    const response = await fetchWithRetries(`${DID_API_URL}/talks/streams/${streamId}`, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_id: sessionId,
            script: {
                type: 'text',
                input: processTextForVoice(text), // Process text server-side too
                provider: {
                    type: voiceSettings.type,
                    voice_id: voiceSettings.voice_id
                }
            },
            config: { stitch: true },
            driver_url: "bank://lively" // Or your specific driver if needed
        })
    });
    if (!response.ok) {
        throw new Error(`Server: Talk request failed status: ${response.status}`);
    }
    const result = await response.json();
    console.log("Server: Talk created successfully:", result);
    return result;
});

const serverCloseStream = server$(async function(streamId: string, sessionId: string) {
    if (!streamId || !sessionId) return;
    console.log("Server: Step 5: Closing the stream");
     const authHeader = await getAuthHeader();
     if (!authHeader) {
         console.error("Server: Cannot close stream, auth header failed");
         return;
     };

    try {
        await fetchWithRetries(`${DID_API_URL}/talks/streams/${streamId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionId })
        });
        console.log("Server: Stream closed successfully");
    } catch (error: any) {
        console.error("Server: Error closing stream:", error.message);
    }
});

const serverFetchLangChainResponse = server$(async function(userMessage: string, threadId: string, language: string) {
    console.log("Server: Fetching LangChain response for thread:", threadId);
    const openAIApiKey = this.env.get('OPENAI_API_KEY') || import.meta.env.OPENAI_API_KEY; // Use the environment variable you have
    if (!openAIApiKey) {
        console.error("OpenAI API Key not configured on server.");
        return "Error: AI service not configured.";
    }

    try {
        const llm = new ChatOpenAI({
            openAIApiKey: openAIApiKey,
            model: "gpt-4o-mini",
            temperature: 0
        });

        const systemContent = `You are a helpful assistant for MOVE ON ACADEMY, a Language Academy. Answer all questions to the best of your ability in ${language}.`;

        // NOTE: LangGraph/Memory management is simplified here.
        // For persistent memory, you'd need a server-side store (e.g., Redis, DB)
        // associated with the threadId to load/save message history.
        // This example just sends the current user message with the system prompt.
        const messages = [
            new SystemMessage(systemContent),
            new HumanMessage(userMessage)
        ];

        const response = await llm.invoke(messages);
        console.log("Server: LangChain response:", response.content);
        return response.content as string;

    } catch (error: any) {
        console.error("Server: Error in LangChain model:", error);
        return "I'm sorry, I encountered an error processing your request.";
    }
});

const serverProcessAudio = server$(async function(formData: FormData, language: string): Promise<string> {
    console.log("Server: Processing audio with OpenAI STT");
    const openAIApiKey = this.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
        console.error("OpenAI API Key not configured on server.");
        return "Error: Speech service not configured.";
    }

    try {
        // Add language hint to FormData before sending
        formData.append("prompt", `The following is a conversation in ${language}.`);
        formData.append("model", "whisper-1"); // Specify model if needed
        formData.append("response_format", "text");


        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openAIApiKey}`,
                // Content-Type is set automatically by fetch for FormData
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Server: OpenAI STT API error:", response.status, errorData);
            throw new Error(`OpenAI STT API error: ${response.status}`);
        }

        const transcriptionText = await response.text();
        console.log("Server: Transcription result:", transcriptionText);
        return transcriptionText.trim();

    } catch (error: any) {
        console.error("Server: Error processing audio with OpenAI:", error);
        return "Error processing audio.";
    }
});

const serverSaveChatMessage = server$(async function(sessionId: string, userMessage: string, botResponse: string, userId: string | undefined) {
    if (!userId) {
        console.warn("Server: Cannot save chat message, user not logged in.");
        return;
    }
    console.log("Server: Saving chat message for user:", userId);
    try {
        const client = tursoClient(this); // Pass full request event context
        await client.execute({
            sql: "INSERT INTO chat_history (sessionId, userId, userMessage, botResponse, timestamp) VALUES (?, ?, ?, ?, ?)",
            args: [sessionId, userId, userMessage, botResponse, new Date().toISOString()]
        });
        console.log("Server: Chat message saved successfully");
    } catch (error: any) {
        console.error("Server: Error saving chat message to Turso:", error.message);
    }
});

const serverUpdateUserLang = server$(async function(userId: string | undefined, lang: string) {
     if (!userId) {
        console.warn("Server: Cannot update language, user not logged in.");
        return;
    }
    console.log("Server: Updating language for user:", userId, "to", lang);
     try {
        const client = tursoClient(this); // Pass full request event context
        // Assuming a 'users' table with 'id' and 'chatbotLang' columns
        await client.execute({
            sql: "UPDATE users SET chatbotLang = ? WHERE id = ?",
            args: [lang, userId]
        });
        console.log("Server: User language updated successfully");
    } catch (error: any) {
        console.error("Server: Error updating user language in Turso:", error.message);
    }
});


// --- Route Loader ---
export const useInitialData = routeLoader$(async (requestEv) => {
    const session = requestEv.sharedMap.get('session');
    let userLanguage = 'en-US'; // Default
    let userId: string | undefined = undefined;

    // First check for session.user.id
    if (session?.user?.id) {
        userId = session.user.id;
    } else {
        // Fallback to checking the auth_token cookie directly
        const authToken = requestEv.cookie.get('auth_token')?.value;
        if (!authToken) {
            // If no auth token, redirect to login
            console.log("[CHAT] No authentication found, redirecting to login");
            throw requestEv.redirect(302, '/auth/');
        }
        // Use the auth token as the user ID
        console.log("[CHAT] Using auth_token cookie for authentication");
        userId = authToken;
    }
    
    try { // Start try block for DB query
        const client = tursoClient(requestEv); // Pass full request event
        // At this point, userId is guaranteed to be a string (not undefined)
        // because we checked with if (!session?.user?.id) above
        const id = userId as string; // Explicitly cast to string for TypeScript
        const result = await client.execute({
            sql: "SELECT chatbotLang FROM users WHERE id = ? LIMIT 1",
            args: [id]
        });
        if (result.rows.length > 0 && result.rows[0].chatbotLang) {
            // Ensure the loaded language is valid
            const validLang = languages.some(l => l.value === result.rows[0].chatbotLang);
            if (validLang) {
                userLanguage = result.rows[0].chatbotLang as string;
            } else {
                console.warn(`Loaded invalid language '${result.rows[0].chatbotLang}' for user ${userId}, using default.`);
            }
        }
    } catch (e: any) { // Catch block for the DB query try
        console.error("Failed to load user language from DB:", e.message);
    } // Closing brace for try block

    return {
        initialLanguage: userLanguage,
        userId: userId,
        // Generate initial thread ID here if not persisting per user
        initialThreadId: crypto.randomUUID()
    };
});


// --- Component ---
export default component$(() => {
    useStylesScoped$(STYLES);
    const initialData = useInitialData();
    // const session = useAuthSession(); // Removed as session object is not used directly

    // --- State Signals & Stores ---
    const streamId = useSignal("");
    const sessionId = useSignal("");
    const connected = useSignal(false);
    const initiating = useSignal(false);
    const loading = useSignal(false); // For AI response/talk generation
    const muteVideo = useSignal(false);
    const connectionError = useSignal<string | null>(null);
    const isRecording = useSignal(false);
    const recordingTime = useSignal(0);
    const threadId = useSignal(initialData.value?.initialThreadId ?? crypto.randomUUID()); // Use optional chaining and default

    const chatHistory = useStore<ChatMessage[]>([
        { role: "assistant", content: "Welcome to the chatbot of MOA. Feel free to speak with Alice" },
    ]);
    const formValues = useStore<FormValues>({
        userResponse: "",
        language: initialData.value?.initialLanguage ?? 'en-US', // Use optional chaining and default
    });

    // --- Refs ---
    const videoRef = useSignal<HTMLVideoElement>();
    const chatMessagesRef = useSignal<HTMLDivElement>();
    const inputRef = useSignal<HTMLInputElement>();
    const peerConnectionRef = useSignal<any>(null);
    const recorderRef = useSignal<any>(null);
    const timerIntervalRef = useSignal<NodeJS.Timeout | null>(null);
    const statsIntervalIdRef = useSignal<NodeJS.Timeout | null>(null);
    const lastBytesReceivedRef = useSignal(0);
    const videoIsPlayingRef = useSignal(false);
    const connectionTimeoutRef = useSignal<NodeJS.Timeout | null>(null);


    // --- QRL Functions for WebRTC/Component Logic ---

    // Define these functions outside useVisibleTask$ so they can be called by event handlers too

    const setVideoElement$ = $((stream: MediaStream | null) => {
        const video = videoRef.value;
        if (!video) return;

        if (stream) {
            console.log("Setting video stream with tracks:", stream.getTracks().length);
            stream.getTracks().forEach(track => {
                console.log(`Track: ${track.id}, kind: ${track.kind}, state: ${track.readyState}`);
            });
            
            // IMPORTANT: We need to avoid stopping tracks coming from the peer connection
            // as that can cause them to end prematurely
            
            // Only stop tracks if they're not from our WebRTC connection
            if (video.srcObject && !peerConnectionRef.value) {
                try {
                    console.log("Stopping non-WebRTC tracks");
                    (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                } catch (err) {
                    console.warn("Error stopping tracks:", err);
                }
            }
            
            // Set the new stream without stopping its tracks
            video.srcObject = stream;
            video.loop = false;
            video.muted = muteVideo.value; // Ensure mute state is respected
            
            // Make sure the video is not hidden
            video.style.visibility = 'visible';
            video.style.display = 'block';
            video.style.display = 'block';
            
            // Play with fallback to muted if needed
            video.play().catch(e => {
                console.error('Error playing stream video:', e);
                if (e.name === 'NotAllowedError') {
                    console.log('Autoplay policy error, trying with muted video');
                    video.muted = true;
                    video.play().catch(e2 => {
                        console.error('Still cannot play stream even with mute:', e2);
                    });
                }
            });
        } else {
            console.log("Clearing video stream");
            if (video.srcObject) {
               (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
            video.srcObject = null;
            // After clearing, always revert to idle video
            playIdleVideo$(); // Switch to idle when stream is removed - Call the QRL version
        }
    });
const playIdleVideo$ = $(() => {
    const video = videoRef.value;
    if (!video) {
        console.error("Cannot play idle video - video element reference is null");
        return;
    }

    console.log("Attempting to play idle video");
    
    // Always completely reset the video element for a clean slate
    // For idle video we can safely stop all tracks since we're switching modes
    if (video.srcObject) {
        console.log("Switching to idle video, stopping existing stream tracks");
        try {
            (video.srcObject as MediaStream).getTracks().forEach(track => {
                console.log(`Stopping track for idle video: ${track.id}, kind: ${track.kind}, state: ${track.readyState}`);
                track.stop();
            });
        } catch (err) {
            console.warn("Error stopping tracks for idle video:", err);
        }
        video.srcObject = null; // Clear the srcObject
    }

    if (video.src && video.src.includes('prs_alice.idle.mp4') && !video.paused) {
        console.log("Idle video already playing, no need to restart");
        return;
    }

    // Reset any previous video state
    video.pause();
    video.currentTime = 0;

    // Validamos ruta del archivo
    const videoPath = '/prs_alice.idle.mp4';
    console.log("Ruta del video de espera:", videoPath);

    // Set properties and force play
    try {
        // Set direct properties
        video.src = videoPath;
        video.loop = true;
        video.muted = true; // Force mute initially to ensure autoplay
        video.style.display = 'block';
        video.autoplay = true;
        video.playsInline = true;
        
        console.log("Video properties set, attempting to play idle video from:", video.src);
        
        // Force play immediately with multiple fallbacks
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Idle video playing successfully");
                // Once playing works, restore user's mute preference with a delay
                setTimeout(() => {
                    video.muted = muteVideo.value;
                }, 500);
            }).catch(e => {
                console.error("Error playing idle video:", e);
                
                // First fallback: retry with guaranteed mute
                video.muted = true;
                const retryPromise = video.play();
                
                if (retryPromise !== undefined) {
                    retryPromise.catch(e2 => {
                        console.error("Failed first retry playing idle video:", e2);
                        
                        // Second fallback: try with user interaction simulation
                        setTimeout(() => {
                            video.muted = true;
                            video.play().catch(e3 => {
                                console.error("Failed all retries playing idle video:", e3);
                            });
                        }, 1000);
                    });
                }
            });
        }
    } catch (err) {
        console.error("Exception setting up idle video:", err);
    }
});

     const onVideoStatusChange$ = $((isPlaying: boolean, stream: MediaStream | null) => {
        if (isPlaying && stream) {
            // Check if the stream actually has active video tracks before switching
            const hasActiveTracks = stream.getVideoTracks().some(track => track.readyState === 'live');
            
            if (hasActiveTracks) {
                console.log("Setting active video stream with live tracks");
                // Don't reset srcObject to null as this can cause tracks to be stopped
                if (videoRef.value) {
                    // CRITICAL: We must not stop the WebRTC tracks as it terminates the stream
                    // Don't clear srcObject or stop tracks from the peer connection
                    
                    // Set the stream directly
                    console.log("Setting stream directly to video element");
                    videoRef.value.srcObject = stream;
                    videoRef.value.muted = muteVideo.value;
                    videoRef.value.style.display = 'block';
                    
                    // Play the video
                    videoRef.value.play().catch(e => {
                        console.error('Error playing video:', e);
                        if (e.name === 'NotAllowedError') {
                            videoRef.value!.muted = true;
                            videoRef.value!.play().catch(e2 => {
                                console.error('Still cannot play video:', e2);
                            });
                        }
                    });
                } else {
                    setVideoElement$(stream);
                }
            } else {
                console.log("Stream has no active tracks, keeping idle video");
                playIdleVideo$();
            }
        } else {
            // Only play idle if not currently loading a response/talk
            if (!loading.value) {
                console.log("No active stream, playing idle video");
                playIdleVideo$();
            }
        }
    });

    const onIceGatheringStateChange$ = $(() => {
        const pc = peerConnectionRef.value;
        if (!pc) return;
        console.log('ICE gathering state:', pc.iceGatheringState);
    });

    const onIceCandidate$ = $(async (event: RTCPeerConnectionIceEvent) => {
        const pc = peerConnectionRef.value;
        if (!event.candidate || !streamId.value || !sessionId.value || !pc) return;
        console.log('ICE candidate:', event.candidate);
        const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
        try {
            await serverSendIceCandidate(streamId.value, sessionId.value, {
                candidate, sdpMid, sdpMLineIndex
            });
        } catch (error) {
            console.error('Client: Failed to send ICE candidate via server:', error);
        }
    });

    const onIceConnectionStateChange$ = $(() => {
        const pc = peerConnectionRef.value;
        if (!pc) return;
        const state = pc.iceConnectionState;
        console.log('ICE connection state:', state);

        if (state === 'connected' || state === 'completed') {
            if (connectionTimeoutRef.value) {
                clearTimeout(connectionTimeoutRef.value);
                connectionTimeoutRef.value = null;
            }
            connected.value = true;
            connectionError.value = null;
            console.log('Connection established successfully');
        } else if (state === 'failed' || state === 'closed' || state === 'disconnected') {
            console.error('ICE connection failed or closed');
            // Attempt cleanup, but avoid recursive connection attempts here
            closePC$(false); // Close without triggering server close yet - Call QRL version
            connected.value = false;
            connectionError.value = 'Connection failed. Please try reconnecting.';
        }
    });

     const onConnectionStateChange$ = $(() => {
        const pc = peerConnectionRef.value;
        if (!pc) return;
        const state = pc.connectionState;
        console.log('Peer connection state:', state);
        if (state === 'connected') {
            connected.value = true;
            connectionError.value = null;
        } else if (state === 'failed' || state === 'closed') {
            connected.value = false;
            connectionError.value = 'Connection failed. Please try reconnecting.';
            closePC$(false); // Call QRL version
        }
    });

    const onSignalingStateChange$ = $(() => {
        const pc = peerConnectionRef.value;
        if (!pc) return;
        console.log('Signaling state:', pc.signalingState);
    });
const onTrack$ = $((event: RTCTrackEvent) => {
    console.log('onTrack event fired:', event);
    const pc = peerConnectionRef.value;
    if (!event.track || !pc) {
        console.log('onTrack: Event received but no valid track or PC found.');
        return;
    }
    
    console.log(`Track received: ${event.track.id}, kind: ${event.track.kind}, state: ${event.track.readyState}`);
    
    // Keep track of all received tracks for debugging
    event.track.addEventListener('ended', () => {
        console.log(`Track ended: ${event.track.id}, kind: ${event.track.kind}`);
    });
    
    // Create a listener for when the track starts actually flowing data
    event.track.addEventListener('unmute', () => {
        console.log(`Track unmuted: ${event.track.id}, kind: ${event.track.kind}`);
        if (event.streams && event.streams.length > 0) {
            // Store the stream directly to avoid garbage collection
            const stream = event.streams[0];
            
            // If this is a video track, try to use it
            if (event.track.kind === 'video' && stream.getVideoTracks().length > 0) {
                console.log('Video stream available after unmute');
                
                // Directly set to video element to avoid our helper function that might
                // be stopping tracks inadvertently
                const video = videoRef.value;
                if (video) {
                    console.log('Setting unmuted stream directly to video element');
                    
                    // Just set the srcObject directly without stopping tracks
                    video.srcObject = stream;
                    video.style.display = 'block';
                    video.muted = muteVideo.value;
                    
                    video.play().catch(e => {
                        console.error('Error playing unmuted stream:', e);
                        if (e.name === 'NotAllowedError') {
                            video.muted = true;
                            video.play().catch(e2 => {
                                console.error('Still cannot play unmuted stream:', e2);
                            });
                        }
                    });
                }
            }
        }
    });

    // Don't clear stats interval - we need it to continuously monitor stream activity

        // Don't immediately switch to the stream until we confirm there's actual video data
        // Keep showing idle video until we have confirmed video data flowing
        
        statsIntervalIdRef.value = setInterval(async () => {
            if (!pc || pc.connectionState !== 'connected') { // Check pc ref directly
                if (statsIntervalIdRef.value) clearInterval(statsIntervalIdRef.value);
                return;
            }
            try {
                const stats = await pc.getStats(event.track);
                let foundActiveVideo = false;
                stats.forEach((report: RTCStats) => {
                    if (report.type === 'inbound-rtp' && 'mediaType' in report && report.mediaType === 'video') {
                        foundActiveVideo = true;
                        const bytesReceived = 'bytesReceived' in report ? report.bytesReceived as number : 0;
                        // Only consider video actively playing if we're receiving actual data
                        const isActivelyReceivingData = bytesReceived > lastBytesReceivedRef.value && bytesReceived > 0;
                        const videoStatusChanged = videoIsPlayingRef.value !== isActivelyReceivingData;
                        
                        if (videoStatusChanged) {
                            videoIsPlayingRef.value = isActivelyReceivingData;
                            if (isActivelyReceivingData) {
                                console.log("D-ID video stream now actively receiving data, switching from idle");
                                onVideoStatusChange$(true, event.streams[0]); // Call QRL version
                            } else if (!loading.value) {
                                console.log("D-ID video stream paused, reverting to idle");
                                onVideoStatusChange$(false, null); // Call QRL version
                            }
                        }
                        lastBytesReceivedRef.value = bytesReceived;
                    }
                });
                
                if (!foundActiveVideo && videoIsPlayingRef.value) {
                    console.log("No active video tracks found in stats");
                    videoIsPlayingRef.value = false;
                    if (!loading.value) { // Only play idle if not loading response
                        onVideoStatusChange$(false, null); // Call QRL version
                    }
                }
            } catch (error) {
                console.error('Error getting stats:', error);
                if (statsIntervalIdRef.value) clearInterval(statsIntervalIdRef.value);
            }
        }, 1000);

        // We don't immediately switch to the stream on track event
        // Instead, we wait for the stats interval to confirm actual video data
        console.log("Video track received, waiting for active video data before switching from idle");
    });

    const closePC$ = $((triggerServerClose = true) => {
        const pc = peerConnectionRef.value;
        if (!pc) return;
        console.log('Client: Closing peer connection');

        pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange$);
        pc.removeEventListener('icecandidate', onIceCandidate$);
        pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange$);
        pc.removeEventListener('connectionstatechange', onConnectionStateChange$);
        pc.removeEventListener('signalingstatechange', onSignalingStateChange$);
        pc.removeEventListener('track', onTrack$);

        if (statsIntervalIdRef.value) {
            clearInterval(statsIntervalIdRef.value);
            statsIntervalIdRef.value = null;
        }
         if (connectionTimeoutRef.value) {
            clearTimeout(connectionTimeoutRef.value);
            connectionTimeoutRef.value = null;
        }

        // Stop video tracks associated with the connection
        const video = videoRef.value;
        if (video?.srcObject && video.srcObject instanceof MediaStream) {
             console.log("Stopping tracks during PC close");
             video.srcObject.getTracks().forEach(track => track.stop());
             video.srcObject = null;
        }

        pc.close();
        peerConnectionRef.value = null; // Update the signal
        connected.value = false; // Ensure connected state is false
        videoIsPlayingRef.value = false; // Reset video playing state
        lastBytesReceivedRef.value = 0;

        console.log('Client: Peer connection closed');

        // Optionally trigger server-side stream closure
        if (triggerServerClose && streamId.value && sessionId.value) {
            serverCloseStream(streamId.value, sessionId.value).catch(err => {
                console.error("Client: Error during server close stream:", err);
            });
            streamId.value = "";
            sessionId.value = "";
        }
         // Ensure idle video plays after closing
        // Intenta reproducir el video de espera con retraso para dar tiempo a limpiar recursos
        setTimeout(() => {
            playIdleVideo$();
            console.log("Reproduciendo video de espera después de cerrar conexión");
        }, 500);
    });

    const createPeerConnection$ = $(async (offer: RTCSessionDescriptionInit, iceServers: RTCIceServer[]) => {
        if (peerConnectionRef.value) {
            console.warn("Closing existing peer connection before creating new one.");
            closePC$(false); // Close client-side only first - Call QRL version
        }

        try {
            console.log("Client: Creating Peer Connection");
            const newPC = new RTCPeerConnection({ iceServers });

            // Use the QRL handlers
            newPC.addEventListener('icegatheringstatechange', onIceGatheringStateChange$);
            newPC.addEventListener('icecandidate', onIceCandidate$);
            newPC.addEventListener('iceconnectionstatechange', onIceConnectionStateChange$);
            newPC.addEventListener('connectionstatechange', onConnectionStateChange$);
            newPC.addEventListener('signalingstatechange', onSignalingStateChange$);
            newPC.addEventListener('track', onTrack$);

            console.log("Client: Setting remote description");
            await newPC.setRemoteDescription(offer); // Offer is already an object

            console.log("Client: Creating answer");
            const answer = await newPC.createAnswer();

            console.log("Client: Setting local description");
            await newPC.setLocalDescription(answer);

            peerConnectionRef.value = noSerialize(newPC); // Use noSerialize to prevent serialization issues
            return answer;

        } catch (error) {
            console.error('Client: Error creating peer connection:', error);
            peerConnectionRef.value = null; // Ensure ref is null on error
            throw error;
        }
    });

    const connect$ = $(async () => {
        if (connected.value || initiating.value) return; // Prevent multiple concurrent attempts

        initiating.value = true;
        connectionError.value = null;
        closePC$(false); // Close existing client-side connection if any, don't trigger server close yet - Call QRL version

        try {
            playIdleVideo$(); // Start with idle video - Call QRL version

            console.log("Client: Calling serverInitConnection");
            const { streamId: newStreamId, offer, iceServers, sessionId: newSessionId } = await serverInitConnection();

            streamId.value = newStreamId;
            sessionId.value = newSessionId;

            console.log("Client: Stream/Session IDs received:", newStreamId, newSessionId);
            console.log("Client: Creating peer connection with offer");
            const answer = await createPeerConnection$(offer, iceServers); // Call QRL version

            console.log("Client: Sending SDP answer via server");
            await serverSendSdpAnswer(newStreamId, newSessionId, answer);

            // Set connection timeout
             if (connectionTimeoutRef.value) clearTimeout(connectionTimeoutRef.value);
             connectionTimeoutRef.value = setTimeout(() => {
                if (!connected.value) {
                    console.error('Connection timeout - checking status');
                     const pc = peerConnectionRef.value; // Check current value
                     if (pc && (pc.iceConnectionState === 'checking' || pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed')) {
                        console.log('Connection appears stable despite timeout - forcing connected state');
                        connected.value = true; // Force connected state if ICE seems okay
                        connectionError.value = null;
                    } else {
                        console.error('Connection truly timed out');
                        connectionError.value = "Connection timed out. Please try reconnecting.";
                        closePC$(true); // Close connection fully including server - Call QRL version
                    }
                }
            }, 15000); // 15 second timeout

            console.log("Client: Waiting for ICE connection...");

        } catch (error: any) {
            console.error('Client: Error during connection initialization:', error);
            connectionError.value = `Connection error: ${error.message || 'Unknown error'}`;
            closePC$(true); // Ensure full cleanup on error - Call QRL version
            connected.value = false;
            streamId.value = "";
            sessionId.value = "";
            
            // Ensure the video plays on error with a slight delay
            setTimeout(() => {
                playIdleVideo$(); // Retry playing idle video with a delay
                console.log("Attempting to play idle video after connection error");
            }, 1000);
        } finally {
            initiating.value = false;
        }
    });


    // --- Client-Side Effects (useVisibleTask$) ---

    // Initialize & Cleanup WebRTC / D-ID Connection
    useVisibleTask$(({ cleanup }) => {
        console.log("Inicializando componente de chat...");
        
        // Reproducir video de espera inmediatamente con reintento
        setTimeout(() => {
            playIdleVideo$();
            console.log("Primer intento de reproducir video de espera");
            
            // Reintento adicional por si acaso
            setTimeout(() => {
                if (!connected.value) {
                    playIdleVideo$();
                    console.log("Segundo intento de reproducir video de espera");
                }
            }, 2000);
        }, 500);
        
        // Intento de conexión después de un retraso para asegurar que el DOM esté listo
        setTimeout(() => {
            connect$();
        }, 1500);

        // Cleanup function when component unmounts
        cleanup(() => {
            console.log("Client: Cleanup running");
             closePC$(true); // Call the QRL function for full cleanup
             // Clear any other intervals/timeouts if necessary
             if (timerIntervalRef.value) clearInterval(timerIntervalRef.value);
             if (statsIntervalIdRef.value) clearInterval(statsIntervalIdRef.value);
             if (connectionTimeoutRef.value) clearTimeout(connectionTimeoutRef.value);
        });
    });

    // Scroll chat to bottom on new message
    useVisibleTask$(({ track }) => {
        track(() => chatHistory.length);
        const chatEl = chatMessagesRef.value;
        if (chatEl) {
            // Delay scroll slightly to allow DOM update
            setTimeout(() => {
                chatEl.scrollTop = chatEl.scrollHeight;
            }, 50);
        }
    });

    // --- Event Handlers ($) ---

    const handleLanguageChange$ = $(async (event: Event) => {
        const newLang = (event.target as HTMLSelectElement).value;
        formValues.language = newLang;
        // Persist language preference to DB if user is logged in
        // Use optional chaining for safety
        if (initialData.value?.userId) {
           await serverUpdateUserLang(initialData.value.userId, newLang);
        }
    });

    const toggleMuteVideo$ = $(() => {
        muteVideo.value = !muteVideo.value;
        if (videoRef.value) {
            videoRef.value.muted = muteVideo.value;
        }
        console.log(`Video ${muteVideo.value ? 'muted' : 'unmuted'}`);
    });

    const handleReconnectClick$ = $(() => { // Now this can simply call the connect$ QRL
         console.log("Manual reconnect triggered");
         connect$(); // Call the refactored connect QRL
    });


    const startTalk$ = $(async (userInput: string) => {
        if (!userInput.trim()) return;

        loading.value = true;
        connectionError.value = null; // Clear previous errors on new interaction

        // Add user message immediately
        chatHistory.push({ role: 'user', content: userInput });
        if (inputRef.value) inputRef.value.value = ''; // Clear input field

        try {
            // 1. Get LangChain Response
            console.log("Client: Fetching LangChain response");
            const botResponse = await serverFetchLangChainResponse(
                userInput,
                threadId.value,
                languageMap[formValues.language] || 'English'
            );

            // Add assistant message
            chatHistory.push({ role: 'assistant', content: botResponse });

            // 2. Save to DB (fire and forget)
            // Use optional chaining for safety
            serverSaveChatMessage(sessionId.value || 'no-session', userInput, botResponse, initialData.value?.userId)
                .catch(err => console.error("Client: Failed to save chat message:", err));


            // 3. Create D-ID Talk (if not muted and connected)
            if (muteVideo.value) {
                console.log("Video muted, skipping talk creation.");
                loading.value = false;
                return;
            }

            // Ensure connection is ready
            if (!connected.value || !streamId.value || !sessionId.value) {
                console.warn("Not connected, attempting to connect before talk...");
                // await handleReconnectClick$(); // Attempt reconnect
                // await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for potential connection

                // if (!connected.value || !streamId.value || !sessionId.value) {
                //     console.error("Connection failed, cannot create talk.");
                //     connectionError.value = "Connection failed. Cannot play response.";
                //     loading.value = false;
                //     return;
                // }
                 console.error("Not connected, cannot create talk.");
                 connectionError.value = "Not connected. Cannot play response.";
                 loading.value = false;
                 return; // Don't proceed if not connected
            }
            console.log("Client: Creating talk");
            const voiceSettings = getVoiceSettings(formValues.language);
            await serverCreateTalk(botResponse, voiceSettings, streamId.value, sessionId.value);
            console.log("Client: Talk request sent");
            
            // Ensure we're properly monitoring for the talk video stream
            if (peerConnectionRef.value && videoRef.value) {
                console.log("Setting up enhanced talk stream detection");
                
                // Reset detection variables
                videoIsPlayingRef.value = false;
                lastBytesReceivedRef.value = 0;
                
                // Clear any existing stats interval
                if (statsIntervalIdRef.value) {
                    clearInterval(statsIntervalIdRef.value);
                    statsIntervalIdRef.value = null;
                }
                
                // Add a more frequent check specifically for talk stream
                const pc = peerConnectionRef.value;
                statsIntervalIdRef.value = setInterval(() => {
                    if (!pc || pc.connectionState !== 'connected') {
                        if (statsIntervalIdRef.value) {
                            clearInterval(statsIntervalIdRef.value);
                            statsIntervalIdRef.value = null;
                        }
                        return;
                    }
                    
                    // Get all active tracks
                    const receivers = pc.getReceivers();
                    const activeVideoTracks = [];
                    
                    for (const receiver of receivers) {
                        if (receiver.track &&
                            receiver.track.kind === 'video' &&
                            receiver.track.readyState === 'live') {
                            activeVideoTracks.push(receiver.track);
                        }
                    }
                    
                    if (activeVideoTracks.length > 0) {
                        console.log(`Found ${activeVideoTracks.length} active video tracks`);
                        
                        // Get all active tracks (video and audio)
                        const allActiveTracks = receivers
                            .filter((receiver: RTCRtpReceiver) => receiver.track && receiver.track.readyState === 'live')
                            .map((receiver: RTCRtpReceiver) => receiver.track);
                        
                        // Create a new stream with all active tracks
                        try {
                            const mediaStream = new MediaStream(allActiveTracks);
                            
                            // Set directly to video element without stopping tracks
                            const video = videoRef.value;
                            if (video) {
                                // Check if we need to update the video element
                                const needsUpdate = !video.srcObject ||
                                    (video.srcObject as MediaStream).getVideoTracks().length === 0 ||
                                    (video.srcObject as MediaStream).getVideoTracks()[0].readyState !== 'live';
                                
                                if (needsUpdate) {
                                    console.log("Updating video element with active stream");
                                    
                                    // Direct assignment without stopping tracks
                                    video.srcObject = mediaStream;
                                    video.muted = muteVideo.value;
                                    video.style.display = 'block';
                                    
                                    // Play the video
                                    video.play().catch(e => {
                                        console.error('Error playing video:', e);
                                        if (e.name === 'NotAllowedError') {
                                            video.muted = true;
                                            video.play().catch(e2 => {
                                                console.error('Still cannot play video:', e2);
                                            });
                                        }
                                    });
                                }
                            }
                        } catch (err) {
                            console.error("Error creating media stream:", err);
                        }
                    }
                }, 300); // Check very frequently for talk stream activation
            }
            
        } catch (error: any) {
            console.error("Client: Error during startTalk:", error);
            chatHistory.push({ role: 'assistant', content: `Error: ${error.message || 'Could not process request.'}` });
            connectionError.value = `Error: ${error.message || 'Could not process request.'}`;
             // Attempt to play idle video on error to reset visual state - Call QRL version
             if (videoRef.value) { // Check ref directly
                 playIdleVideo$();
             }
        } finally {
            loading.value = false;
        }
    });

    const handleSendClick$ = $(() => {
        if (inputRef.value && inputRef.value.value.trim()) {
            startTalk$(inputRef.value.value);
        }
    });

    const handleKeyUp$ = $((event: KeyboardEvent) => {
        if (event.key === 'Enter' && inputRef.value && inputRef.value.value.trim()) {
            startTalk$(inputRef.value.value);
        }
    });

    // --- Audio Recording ---
    const startRecording$ = $(async () => {
        if (isRecording.value) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Or other supported mimeType
            recorderRef.value = noSerialize(mediaRecorder);

            const audioChunks: Blob[] = [];

            mediaRecorder.addEventListener("dataavailable", (event) => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", $(async () => { // Ensure $() for async operations within listener
                const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                stream.getTracks().forEach(track => track.stop()); // Stop stream tracks
                isRecording.value = false;
                recorderRef.value = null;
                if (timerIntervalRef.value) clearInterval(timerIntervalRef.value);
                recordingTime.value = 0;

                if (audioBlob.size > 0) {
                    await processAudio$(audioBlob);
                } else {
                    console.log("Empty recording, skipping processing.");
                }
            }));

            mediaRecorder.start();
            isRecording.value = true;
            recordingTime.value = 0; // Reset timer
            if (timerIntervalRef.value) clearInterval(timerIntervalRef.value); // Clear previous interval
            timerIntervalRef.value = setInterval(() => {
                recordingTime.value++;
            }, 1000);

            // Auto-stop after 30 seconds
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 30000);

        } catch (error) {
            console.error("Error starting recording:", error);
            isRecording.value = false;
            alert("Could not start recording. Please ensure microphone permission is granted.");
        }
    });

    const stopRecording$ = $(() => {
        if (recorderRef.value && recorderRef.value.state === 'recording') {
            recorderRef.value.stop();
            // State changes (isRecording=false, etc.) handled in 'stop' event listener
        }
         if (timerIntervalRef.value) {
            clearInterval(timerIntervalRef.value);
            timerIntervalRef.value = null;
        }
    });

     const processAudio$ = $(async (audioBlob: Blob) => {
        loading.value = true; // Indicate processing
        try {
            const formData = new FormData();
            formData.append("file", audioBlob, "recording.webm"); // Filename is important

            const transcription = await serverProcessAudio(
                formData,
                languageMap[formValues.language] || 'English'
            );

            if (transcription && !transcription.startsWith("Error:")) {
                // Add user message (transcription) and trigger AI response + talk
                await startTalk$(transcription);
            } else {
                console.error("Transcription failed:", transcription);
                chatHistory.push({ role: 'assistant', content: `Audio processing failed: ${transcription}` });
            }
        } catch (error: any) {
            console.error("Client: Error processing audio:", error);
             chatHistory.push({ role: 'assistant', content: `Error processing audio: ${error.message}` });
        } finally {
            loading.value = false;
        }
    });

    const toggleRecording$ = $(() => {
        if (isRecording.value) {
            stopRecording$();
        } else {
            startRecording$();
        }
    });


    // --- Render ---
    return (
        <div class="flex flex-col h-screen w-full relative bg-gray-100 overflow-hidden">
            {/* Header Placeholder - Adapt from layout.tsx if needed */}
            {/* <header class="bg-white shadow-md p-4 text-xl font-bold">MOA Chatbot</header> */}

            <div class="flex flex-row flex-grow items-start w-full p-4 gap-4 overflow-hidden">

                {/* Left Panel: Video & Controls */}
                <div class="w-2/5 flex flex-col h-full space-y-4">
                    {/* Video Area */}
                    <div class="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-black border-4 border-white flex-shrink-0">
                        <video
                            ref={videoRef}
                            id="talk-video"
                            autoplay
                            playsInline
                            muted={muteVideo.value}
                            class="w-full h-full object-cover"
                            preload="auto"
                        />
                        {loading.value && (
                            <div class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                <Spinner />
                                <span>Processing...</span>
                            </div>
                        )}
                         {initiating.value && (
                            <div class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
                                <Spinner />
                                <p class="mt-2 text-sm font-medium">Connecting to Avatar...</p>
                            </div>
                        )}
                    </div>

                    {/* Controls Area */}
                    <div class="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow">
                         {/* Mute & Language */}
                        <div class="flex items-center space-x-3">
                            <button
                                onClick$={toggleMuteVideo$}
                                class={`w-11 h-11 flex justify-center items-center rounded-full text-white shadow transition-colors ${muteVideo.value ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                aria-label={muteVideo.value ? 'Unmute Video' : 'Mute Video'}
                            >
                                {muteVideo.value ? <VolumeMuteIcon /> : <VolumeUpIcon />}
                            </button>
                            <select
                                name="language"
                                value={formValues.language}
                                onChange$={handleLanguageChange$}
                                class="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {languages.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Connection Status & Button */}
                        <div class="text-center pt-2">
                            {!connected.value && !initiating.value && (
                                <button
                                    onClick$={handleReconnectClick$} // Use reconnect handler
                                    class="px-6 py-3 bg-green-500 text-white rounded-full font-semibold shadow hover:bg-green-600 transition duration-200"
                                >
                                    Connect Avatar
                                </button>
                            )}
                            {connected.value && (
                                <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium text-sm shadow-sm">
                                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Connected
                                </div>
                            )}
                             {connectionError.value && (
                                <div class="mt-3 p-3 bg-red-100 text-red-700 rounded-md text-sm shadow-sm flex items-center gap-2">
                                   <AlertTriangleIcon />
                                    <span>{connectionError.value}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Chat */}
                <div class="flex-grow h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Message List */}
                    <div
                        ref={chatMessagesRef}
                        class="flex-grow overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50" // Simple gradient background
                    >
                        {chatHistory.map((message, index) => (
                            <div
                                key={index}
                                class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    class={`max-w-[80%] p-3 rounded-xl shadow-sm animate-bubble-appear ${
                                        message.role === 'user'
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                     <div class="text-xs mb-1 opacity-80 font-medium">
                                        {message.role === 'user' ? 'You' : 'Assistant'}
                                    </div>
                                    <p class="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                         {loading.value && chatHistory[chatHistory.length - 1]?.role === 'user' && (
                             <div class="flex justify-start">
                                <div class="max-w-[80%] p-3 rounded-xl shadow-sm bg-gray-200 text-gray-800 rounded-bl-none">
                                    <div class="text-xs mb-1 opacity-80 font-medium">Assistant</div>
                                    <div class="typing-indicator"><span></span><span></span><span></span></div>
                                </div>
                            </div>
                         )}
                    </div>

                    {/* Input Area */}
                    <div class="flex items-center p-4 border-t border-gray-200 bg-gray-50 relative">
                        {/* Mic Button */}
                         <div class="relative mr-3">
                            <button
                                onClick$={toggleRecording$}
                                disabled={initiating.value || loading.value}
                                class={`w-11 h-11 flex justify-center items-center rounded-full border transition-colors duration-200 shadow-sm ${
                                    isRecording.value
                                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                aria-label={isRecording.value ? 'Stop Recording' : 'Start Recording'}
                            >
                                {isRecording.value ? <MicIcon /> : <MicOffIcon />}
                            </button>
                             {isRecording.value && (
                                <div class="absolute -top-7 -left-6 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow animate-fade-in">
                                    {formatRecordingTime(recordingTime.value)}
                                </div>
                            )}
                        </div>

                        {/* Text Input */}
                        <input
                            ref={inputRef}
                            onKeyUp$={handleKeyUp$}
                            type="text"
                            placeholder={initiating.value ? "Connecting..." : "Type a message..."}
                            disabled={initiating.value || loading.value}
                            class="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100"
                        />

                        {/* Send Button */}
                        <button
                            onClick$={handleSendClick$}
                            disabled={initiating.value || loading.value} // Only disable when loading or initiating
                            class="ml-3 px-5 py-2 bg-blue-500 text-white rounded-full font-semibold shadow hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-[110px]" // Fixed width for consistency
                        >
                            {loading.value ? (
                                <>
                                    <Spinner size="small" />
                                    <span class="ml-1.5">Sending...</span>
                                </>
                            ) : (
                                <>
                                    <SendIcon />
                                    <span class="ml-1.5">Send</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- Placeholder Icons (Replace with SVGs or library like lucide-qwik) ---
export const VolumeUpIcon = component$(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>);
export const VolumeMuteIcon = component$(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>);
export const MicIcon = component$(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>);
export const MicOffIcon = component$(() => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>);
export const SendIcon = component$(() => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
export const AlertTriangleIcon = component$(() => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
export const Spinner = component$<{ size?: 'small' | 'medium' }>(({ size = 'medium' }) => {
    const sizeClass = size === 'small' ? 'w-4 h-4 border-2' : 'w-5 h-5 border-[3px]';
    return <div class={`animate-spin rounded-full ${sizeClass} border-white border-t-transparent`} role="status" aria-label="loading"></div>;
});


// --- Styles ---
export const STYLES = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes bubble-appear {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-bubble-appear {
  animation: bubble-appear 0.3s ease forwards;
}

.typing-indicator span {
  width: 5px;
  height: 5px;
  background-color: currentColor;
  border-radius: 50%;
  display: inline-block;
  margin: 0 1px;
  animation: typing-bounce 1.2s infinite ease-in-out;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.3s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}
.animate-pulse {
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
}

/* Custom scrollbar (optional) */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.3);
}
`;

