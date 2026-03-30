import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

export type SessionInfo = {
  name: string;
  date: string;
  topic: string;
};

export type RatingSubmission = {
  rating: number;
  comment: string;
  tags: string[];
};

const TAG_OPTIONS = [
  "Very helpful",
  "Great communicator",
  "Knowledgeable",
  "Punctual",
  "Inspiring",
];

const MIN_COMMENT_LENGTH = 20;

type RatingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RatingSubmission) => void;
  sessionInfo: SessionInfo | null;
};

export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  sessionInfo,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const displayStars = hoverRating || rating;
  const canSubmit =
    rating > 0 &&
    comment.trim().length >= MIN_COMMENT_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit || !sessionInfo) return;
    onSubmit({ rating, comment: comment.trim(), tags: selectedTags });
    toast.success("Thank you! Your feedback has been submitted.");
    onClose();
    setRating(0);
    setHoverRating(0);
    setComment("");
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setRating(0);
      setHoverRating(0);
      setComment("");
      setSelectedTags([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your session</DialogTitle>
        </DialogHeader>

        {sessionInfo && (
          <>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{sessionInfo.name}</p>
              <p className="text-sm text-gray-600 mt-1">{sessionInfo.date}</p>
              <p className="text-sm text-gray-600">{sessionInfo.topic}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Your rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} out of 5 stars`}
                  >
                    <Star
                      size={32}
                      className={
                        star <= displayStars
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="rating-comment" className="text-sm font-medium text-gray-900 block mb-2">
                Share your experience (min {MIN_COMMENT_LENGTH} characters)
              </label>
              <Textarea
                id="rating-comment"
                placeholder="What went well? What could be improved?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length} / {MIN_COMMENT_LENGTH} characters
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Tags (optional)</p>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                Submit feedback
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
