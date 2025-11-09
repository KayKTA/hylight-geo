"use client";

import { useState } from "react";
import { Stack, TextField, Button } from "@mui/material";
import { Send } from "lucide-react";

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>;
    disabled?: boolean;
}

export default function CommentForm({ onSubmit, disabled = false }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() || submitting) return;

        setSubmitting(true);
        try {
            await onSubmit(content);
            setContent(""); // Clear input on success
        } catch (error) {
            // Error is handled by parent
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <Stack direction="row" spacing={1}>
            <TextField
                fullWidth
                size="small"
                placeholder="Add a note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                disabled={disabled || submitting}
            />
            <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!content.trim() || disabled || submitting}
                sx={{ minWidth: "auto", px: 2 }}
            >
                <Send size={18} />
            </Button>
        </Stack>
    );
}
