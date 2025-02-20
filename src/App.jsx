import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import {
    Loader2,
    Moon,
    Sun,
    Github,
    Bot,
    User,
    Send,
    BarChart2,
    Clipboard,
    Zap,
    Upload,
    FileUp,
    X,
    File,
    FileText,
    Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const FileUploadModal = ({ isOpen, onClose, isDarkMode, onFilesUploaded }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        if (['dragenter', 'dragover'].includes(e.type)) {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files?.[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        const newFiles = Array.from(files).map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: 'uploading',
            file: file,
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);
        newFiles.forEach(fileData => simulateFileUpload(fileData.id));
    };

    const readFileContentPromise = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ name: file.name, content: e.target.result });
            reader.onerror = () => resolve(null); // Resolve null on error
            reader.readAsText(file);
        });
    };


    const simulateFileUpload = (fileId) => {
        setIsUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f));

            if (progress >= 100) {
                clearInterval(interval);
                setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'complete' } : f));
                if (uploadedFiles.every(f => f.status === 'complete')) {
                    setIsUploading(false);
                }
            }
        }, 300);
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleUseSelectedFiles = async () => {
        onClose();
        const fileContentsPromises = uploadedFiles
          .filter(fileData => fileData.status === 'complete')
          .map(fileData => readFileContentPromise(fileData.file));

        const fileContents = await Promise.all(fileContentsPromises);
        onFilesUploaded(fileContents.filter(content => content !== null)); // Filter out any null contents (from read errors)
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-2xl p-6 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Upload Files</h2>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-opacity-10 ${isDarkMode ? 'hover:bg-gray-300' : 'hover:bg-gray-200'}`}>
                        <X size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />
                    </button>
                </div>


                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? (isDarkMode ? 'border-green-400 bg-green-400/10' : 'border-green-600 bg-green-50') : (isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400')
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input ref={fileInputRef} type="file" multiple onChange={handleChange} className="hidden" />
                    <div className="flex flex-col items-center justify-center gap-3" onClick={() => fileInputRef.current?.click()}>
                        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <Upload size={24} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                        </div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Drag files here or click to upload</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Support for PDF, DOC, TXT, CSV and more</p>
                    </div>
                </div>


                {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                        <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Files ({uploadedFiles.length})</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {uploadedFiles.map(file => (
                                <div key={file.id} className={`p-3 rounded-lg flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${file.status === 'complete' ? (isDarkMode ? 'bg-green-400/20' : 'bg-green-100') : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')}`}>
                                            {file.type.includes('pdf') ? <FileText size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} /> : <File size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                                            <div className="flex items-center text-xs gap-2">
                                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{(file.size / 1024).toFixed(1)} KB</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {file.status === 'uploading' ? (
                                            <div className="w-16 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: `${file.progress}%` }} />
                                            </div>
                                        ) : (
                                            <span className={`p-1 rounded-full ${isDarkMode ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-600'}`}><Check size={14} /></span>
                                        )}
                                        <button onClick={() => removeFile(file.id)} className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}><X size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-6 gap-3">
                    <button onClick={onClose} className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>Cancel</button>
                    <button
                        onClick={handleUseSelectedFiles}
                        disabled={uploadedFiles.length === 0 || isUploading}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                            uploadedFiles.length === 0 || isUploading ? 'bg-gray-600 cursor-not-allowed text-gray-300' : (isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white')
                        }`}
                    >
                        {isUploading ? (
                            <><Loader2 size={16} className="animate-spin" /><span>Uploading...</span></>
                        ) : (
                            <><Check size={16} /><span>Use Selected Files</span></>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Card = ({ icon: Icon, title, description, isDarkMode }) => (
    <motion.div className="group relative overflow-hidden mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className={`p-4 rounded-2xl transition-all duration-300 ease-out shadow-lg cursor-pointer ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white hover:shadow-xl' : 'bg-gray-100 hover:bg-gray-200/80'}`}>
            <div className="flex items-start space-x-3">
                <motion.div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center" whileHover={{ scale: 1.1 }}>
                    <Icon className="w-5 h-5 text-green-500" />
                </motion.div>
                <div className="flex-1">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{title}</h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
                </div>
            </div>
        </div>
    </motion.div>
);

const App = () => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const API_KEY = import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;

    // Replace with actual image URL or use a local import
    const logoUrl = "https://cdn.discordapp.com/attachments/1341687232855146565/1341709124139876422/SemiColonError_3.png?ex=67b7a43e&is=67b652be&hm=dce6281aa273776e03de4cd0f5b2d05271ca65dab9954b0844a6f62ccdab8bdc&";


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleApiCall = async (prompt, filename = null) => {
        setIsLoading(true);
        const userMessage = {
            id: Date.now(),
            text: filename ? `Uploaded: ${filename}` : question,
            sender: 'user',
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                { contents: [{ parts: [{ text: prompt }] }] }
            );

            // Formatting the output
            const rawText = response.data.candidates[0].content.parts[0].text;
            const generatedText = `
**Summary:**
${rawText}

**Key Points:**
${rawText.split('. ').map(point => `* ${point}`).join('\n')}
`;

            const botMessage = {
                id: Date.now(),
                text: generatedText,
                sender: 'finora',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Error fetching API response:", error); // Keep for debugging
            const errorMessage = {
                id: Date.now(),
                text: "Sorry, I couldn't process that.",
                sender: 'finora',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);

        } finally {
            setIsLoading(false);
            setQuestion(''); // Clear the question input after sending or error
        }
    };

    const handleFileUpload = async (uploadedFiles) => {
        if (!uploadedFiles?.length) return;

        for (const fileData of uploadedFiles) {
            const basePrompt = `Given the following document:\n${fileData.content}\n\n`;
            await handleApiCall(`${basePrompt} Summarize this document.`, fileData.name);
        }

    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (!question.trim()) return;
        await handleApiCall(question);

    };

    return (
        <div className={`flex h-screen ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
            <AnimatePresence>{isUploadModalOpen && <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} isDarkMode={isDarkMode} onFilesUploaded={handleFileUpload} />}</AnimatePresence>

            <motion.div className={`w-1/3 p-6 flex flex-col rounded-r-2xl ${isDarkMode ? 'bg-gray-800 border-r border-gray-700 text-white shadow-lg' : 'bg-white'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
                <div className="flex items-center justify-between mb-8">
                    <img src={logoUrl} alt="SemiColonError Logo" style={{ width: 'auto', height: '40px' }} />
                    <h1 className="text-2xl font-bold text-pink-500">SemiColonError</h1>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}><Github size={20} /></a>
                    </div>
                </div>
                <h2 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>AI Services</h2>
                <Card icon={BarChart2} title="API Collaboration" description="Smart summmary analysis" isDarkMode={isDarkMode} />
                <Card icon={Clipboard} title="Project Management" description="AI-assisted" isDarkMode={isDarkMode} />
                <Card icon={Zap} title="Efficient Automation" description="Intelligent and fast automation" isDarkMode={isDarkMode} />

                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-2">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Send a message</p>
                        <button onClick={() => setIsUploadModalOpen(true)} className={`flex items-center gap-1 text-sm p-1.5 rounded ${isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-gray-100'}`}><FileUp size={14} /><span>Upload File</span></button>
                    </div>
                    <div className="relative">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask something..."
                            className={`w-full h-32 p-3 pr-12 rounded-lg resize-none focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-700 text-gray-100 focus:ring-green-500/50' : 'bg-gray-100 text-gray-800 focus:ring-green-500/50'}`}
                        />
                        <button
                            onClick={handleSendMessage}
                            className={`absolute bottom-3 right-3 p-2 rounded-lg text-gray-400 ${
                                question.trim() ? (isDarkMode ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white') : 'bg-gray-600/50 cursor-not-allowed'
                            }`}
                            disabled={!question.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                   
                </div>
            </motion.div>

            <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`flex items-center justify-center p-4 border-b ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>AI Summarization</h2>                </div>

                <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className={`text-center max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <h3 className={`text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Unlock the Power of AI</h3>
                                <p className="mb-4">Upload documents for instant summaries or ask any question.</p>
                                <button onClick={() => setIsUploadModalOpen(true)} className={`mb-6 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 shadow-sm'}`}>
                                    <Upload size={16} className={isDarkMode ? 'text-green-400' : 'text-green-600'} /><span>Upload Document</span>
                                </button>
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {['Summarize Anything', 'Reliable', 'Efficient'].map((feature, i) => (
                                        <div key={i} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                            <div className="text-green-500 flex justify-center mb-1">✓</div>
                                            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <motion.div key={msg.id} className={`flex items-start space-x-4 ${msg.sender === 'finora' ? 'justify-start' : 'justify-end'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            {msg.sender === 'finora' ? (
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><Bot size={18} className="text-green-500" /></div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center"><User size={18} className="text-pink-500" /></div>
                            )}
                            <div className={`max-w-[70%] rounded-lg p-4 ${msg.sender === 'finora' ? (isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800 shadow-sm') : 'bg-pink-500 text-white'}`}>
                                {/* Use ReactMarkdown */}
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                <span className={`text-xs block mt-2 ${msg.sender === 'finora' ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : 'text-pink-200'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><Bot size={18} className="text-green-500" /></div>
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}><Loader2 className="w-5 h-5 animate-spin text-green-500" /></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
};

export default App;
