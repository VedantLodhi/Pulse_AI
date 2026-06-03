from flask import Flask, Response, render_template, jsonify, request
import cv2
import mediapipe as mp
import numpy as np
import time
from datetime import timedelta
import threading
import queue
import os
import logging
from dataclasses import dataclass, asdict
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global variables for tracking state
global_frame = None
command_queue = queue.Queue()

@dataclass
class ExerciseState:
    count: int = 0
    exercise_type: str = "pushup"
    is_running: bool = False
    elapsed_time: str = "00:00:00"
    status: str = "PAUSED"
    confidence_score: float = 0.0
    form_feedback: str = "Waiting to detect form..."
    average_confidence: float = 0.0
    valid_reps: int = 0
    invalid_reps: int = 0
    rep_stage: str = "waiting"

# Initialize the global state
global_state = ExerciseState()

@dataclass
class ExerciseConfig:
    name: str
    angle_points: list
    up_threshold: int
    down_threshold: int
    secondary_angle_points: list = None  # For additional angle validation
    form_cues: dict = None  # Form cues and feedback

# Define exercises with enhanced configuration
EXERCISE_CONFIGS = {
    "pushup": ExerciseConfig(
        name="pushup",
        angle_points=[11, 13, 15],  # Right shoulder, elbow, wrist
        up_threshold=160,
        down_threshold=90,
        secondary_angle_points=[12, 14, 16],  # Left arm for symmetry check
        form_cues={
            "back_alignment": {
                "points": [11, 23, 27],  # Shoulder, hip, ankle
                "ideal_angle": 180,
                "tolerance": 15,
                "feedback": "Keep your back straight"
            },
            "elbow_position": {
                "points": [11, 13, 15],
                "ideal_angle": 90,
                "tolerance": 15,
                "feedback": "Lower to 90 degrees at elbow"
            }
        }
    ),
    "situp": ExerciseConfig(
        name="situp",
        angle_points=[11, 23, 25],  # Right shoulder, hip, knee
        up_threshold=170,
        down_threshold=85,
        form_cues={
            "neck_position": {
                "points": [9, 11, 13],  # Ear, shoulder, elbow
                "ideal_angle": 160,
                "tolerance": 20,
                "feedback": "Keep neck neutral, don't pull with head"
            }
        }
    ),
    "curlup": ExerciseConfig(
        name="bicep_curl",  # Renamed consistently in backend config; maps to curlup route
        angle_points=[11, 13, 15],  # Right shoulder, elbow, wrist (tracks bicep curl movement)
        up_threshold=160,
        down_threshold=60,
        secondary_angle_points=[12, 14, 16],  # Left arm for symmetry check
        form_cues={
            "elbow_path": {
                "points": [11, 13, 15],
                "ideal_angle": 90,
                "tolerance": 20,
                "feedback": "Keep elbows close to body"
            }
        }
    ),
    "squat": ExerciseConfig(
        name="squat",
        angle_points=[23, 25, 27],  # Right hip, knee, ankle
        up_threshold=170,
        down_threshold=90,
        secondary_angle_points=[24, 26, 28],  # Left leg for symmetry check
        form_cues={
            # TODO: Implement safe lateral/profile coordinate-based knee-over-toe check.
            # Angle-based [23, 25, 27] hip-knee-ankle check was removed as it incorrectly flagged 
            # bad posture when standing still. Coordinate check should run:
            # dir_factor = 1 if x_toe > x_ankle else -1
            # if dir_factor * (x_knee - x_toe) > tolerance: flag "Keep knees behind toes"
            # Must verify camera is in lateral profile (e.g. by checking shoulder/hip asymmetry)
            # to avoid false positives in front-facing camera setups.
            "back_angle": {
                "points": [11, 23, 25],
                "ideal_angle": 45,
                "tolerance": 15,
                "feedback": "Maintain back angle during squat"
            }
        }
    )
}

class PoseDetector:
    """
    Handles pose detection using MediaPipe Pose model
    """
    def __init__(self, 
                 static_image_mode=False, 
                 model_complexity=2,  # Increased for better accuracy
                 smooth_landmarks=True,
                 enable_segmentation=False,
                 min_detection_confidence=0.6,  # Increased for more stable detection
                 min_tracking_confidence=0.6):  # Increased for more stable tracking
        """
        Initialize pose detector with MediaPipe
        
        Args:
            static_image_mode: Whether to process as static images
            model_complexity: Model complexity (0, 1, or 2)
            smooth_landmarks: Whether to filter landmarks
            enable_segmentation: Whether to enable segmentation
            min_detection_confidence: Minimum confidence for detection
            min_tracking_confidence: Minimum confidence for tracking
        """
        self.static_image_mode = static_image_mode
        self.model_complexity = model_complexity
        self.smooth_landmarks = smooth_landmarks
        self.enable_segmentation = enable_segmentation
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=self.static_image_mode,
            model_complexity=self.model_complexity,
            smooth_landmarks=self.smooth_landmarks,
            enable_segmentation=self.enable_segmentation,
            min_detection_confidence=self.min_detection_confidence,
            min_tracking_confidence=self.min_tracking_confidence
        )
        
        self.landmark_list = []
        self.results = None
    
    def find_pose(self, img, draw=True):
        """
        Process image through MediaPipe Pose
        
        Args:
            img: Input image (BGR)
            draw: Whether to draw pose landmarks
            
        Returns:
            Processed image with landmarks drawn (if draw=True)
        """
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.pose.process(img_rgb)
        
        if self.results.pose_landmarks and draw:
            # Enhanced drawing style
            self.mp_drawing.draw_landmarks(
                img, 
                self.results.pose_landmarks, 
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )
        
        return img
    
    def find_position(self, img, draw=False):
        """
        Find position of all landmarks
        
        Args:
            img: Input image
            draw: Whether to draw landmark points
            
        Returns:
            List of landmark positions [id, x, y, visibility]
        """
        self.landmark_list = []
        if self.results and self.results.pose_landmarks:
            h, w, c = img.shape
            for id, lm in enumerate(self.results.pose_landmarks.landmark):
                cx, cy = int(lm.x * w), int(lm.y * h)
                self.landmark_list.append([id, cx, cy, lm.visibility])
                if draw:
                    cv2.circle(img, (cx, cy), 5, (255, 0, 0), cv2.FILLED)
        
        return self.landmark_list
    
    def find_angle(self, img, p1, p2, p3, draw=True):
        """
        Calculate angle between three points
        
        Args:
            img: Input image
            p1, p2, p3: Point indices (p2 is the vertex)
            draw: Whether to draw angle visualization
            
        Returns:
            Angle in degrees
        """
        if len(self.landmark_list) <= max(p1, p2, p3):
            return 0
            
        # Get landmarks
        x1, y1 = self.landmark_list[p1][1:3]
        x2, y2 = self.landmark_list[p2][1:3]
        x3, y3 = self.landmark_list[p3][1:3]
        
        # Calculate angle
        angle = np.degrees(np.arctan2(y3 - y2, x3 - x2) - np.arctan2(y1 - y2, x1 - x2))
        if angle < 0:
            angle += 360
            
        # Keep angle between 0-180
        if angle > 180:
            angle = 360 - angle
        
        # Draw
        if draw:
            # Draw lines between points
            cv2.line(img, (x1, y1), (x2, y2), (255, 255, 255), 3)
            cv2.line(img, (x3, y3), (x2, y2), (255, 255, 255), 3)
            
            # Draw circles at points
            cv2.circle(img, (x1, y1), 10, (0, 0, 255), cv2.FILLED)
            cv2.circle(img, (x2, y2), 10, (0, 255, 0), cv2.FILLED)
            cv2.circle(img, (x3, y3), 10, (0, 0, 255), cv2.FILLED)
            
            # Add outlines for better visibility
            cv2.circle(img, (x1, y1), 15, (0, 0, 255), 2)
            cv2.circle(img, (x2, y2), 15, (0, 255, 0), 2)
            cv2.circle(img, (x3, y3), 15, (0, 0, 255), 2)
            
            # Display angle
            cv2.putText(img, f'{int(angle)}°', (x2 - 50, y2 + 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        return angle
        
    def check_visibility(self, landmark_indices, threshold=0.65):
        """
        Check if specified landmarks are visible enough
        
        Args:
            landmark_indices: List of landmark indices to check
            threshold: Minimum visibility score
            
        Returns:
            Boolean indicating if landmarks are sufficiently visible
        """
        if not self.landmark_list:
            return False
            
        for idx in landmark_indices:
            if idx >= len(self.landmark_list) or self.landmark_list[idx][3] < threshold:
                return False
        return True
        
    def check_form(self, img, form_cue):
        """
        Check exercise form based on angle between points
        
        Args:
            img: Input image
            form_cue: Dictionary with form check parameters
            
        Returns:
            (is_good_form, angle, feedback)
        """
        points = form_cue["points"]
        ideal_angle = form_cue["ideal_angle"]
        tolerance = form_cue["tolerance"]
        feedback = form_cue["feedback"]
        
        # Skip if any point is not visible
        if not self.check_visibility(points):
            return None, 0, ""
            
        # Calculate the angle
        angle = self.find_angle(img, *points, draw=False)
        
        # Check if within tolerance
        is_good_form = abs(angle - ideal_angle) <= tolerance
        
        return is_good_form, angle, feedback if not is_good_form else "Good form"

class FitnessTracker:
    """
    Main class for tracking fitness exercises
    """
    def __init__(self):
        """Initialize the fitness tracker"""
        self.detector = PoseDetector()
        self.count = 0
        self.dir = 0  # 0 for going down, 1 for going up
        self.exercise_type = "pushup"  # Default exercise
        self.is_running = False
        self.start_time = None
        self.elapsed_time = timedelta(0)
        self.prev_time = 0
        self.confidence_score = 0.0
        self.form_feedback = "Waiting to detect form..."
        self.rep_history = []  # Store data about each rep for analysis
        self.display_debug = False  # Toggle for debug visualization
        
        # Rep detection state
        self.position_buffer = []  # Buffer for smoothing angle values
        self.buffer_size = 5
        self.rep_started = False
        self.rep_stage = "waiting"  # waiting, down, up
        self.last_angle = 0
        self.rep_start_time = None
        self.is_rep_form_valid = True
        self.current_rep_issues = []
        
    def get_exercise_config(self):
        """Get configuration for current exercise type"""
        return EXERCISE_CONFIGS.get(self.exercise_type, EXERCISE_CONFIGS["pushup"])
    
    def process_frame(self, img):
        """
        Process a video frame for exercise tracking
        
        Args:
            img: Input frame from camera
            
        Returns:
            Processed frame with overlays
        """
        if img is None or img.size == 0:
            logger.warning("Empty frame received")
            return np.zeros((480, 640, 3), dtype=np.uint8)
            
        # Flip image for more intuitive viewing
        img = cv2.flip(img, 1)
        
        # Get original dimensions for overlay positioning
        h, w, c = img.shape
        
        try:
            # Find pose landmarks
            img = self.detector.find_pose(img)
            self.detector.find_position(img)
            
            # Calculate current FPS
            current_time = time.time()
            fps = 1 / (current_time - self.prev_time) if self.prev_time > 0 else 0
            self.prev_time = current_time
            
            # Overlay semi-transparent background for UI elements
            overlay = img.copy()
            cv2.rectangle(overlay, (0, 0), (w, 130), (0, 0, 0), -1)
            cv2.rectangle(overlay, (0, h-60), (w, h), (0, 0, 0), -1)
            img = cv2.addWeighted(overlay, 0.3, img, 0.7, 0)
            
            if len(self.detector.landmark_list) > 0:
                exercise_config = self.get_exercise_config()
                
                # Primary angle detection
                p1, p2, p3 = exercise_config.angle_points
                up_threshold = exercise_config.up_threshold
                down_threshold = exercise_config.down_threshold
                
                # Check if required points are visible
                key_points = exercise_config.angle_points.copy()
                if exercise_config.secondary_angle_points:
                    key_points.extend(exercise_config.secondary_angle_points)
                
                if all(point < len(self.detector.landmark_list) for point in key_points):
                    # Landmark visibility gating (min_visibility = 0.65)
                    is_visible = self.detector.check_visibility(key_points, threshold=0.65)
                    
                    if not is_visible:
                        self.form_feedback = "Please position your body in view"
                        self.confidence_score = 0.0
                        percentage = 0
                        smoothed_angle = 0
                    else:
                        # Calculate primary angle
                        angle = self.detector.find_angle(img, p1, p2, p3)
                        
                        # Add to buffer for smoothing
                        self.position_buffer.append(angle)
                        if len(self.position_buffer) > self.buffer_size:
                            self.position_buffer.pop(0)
                        
                        # Calculate smoothed angle
                        smoothed_angle = sum(self.position_buffer) / len(self.position_buffer)
                        
                        # Calculate secondary angle for symmetry check if available
                        symmetry_score = 1.0
                        if exercise_config.secondary_angle_points:
                            s1, s2, s3 = exercise_config.secondary_angle_points
                            sec_angle = self.detector.find_angle(img, s1, s2, s3, draw=False)
                            # Calculate symmetry score (1.0 = perfect symmetry)
                            angle_diff = abs(angle - sec_angle)
                            symmetry_score = max(0, 1.0 - (angle_diff / 180))
                        
                        # Convert angle to rep percentage
                        percentage = np.interp(smoothed_angle, (down_threshold, up_threshold), (0, 100))
                        
                        # Check form
                        form_issues = []
                        if exercise_config.form_cues:
                            for cue_name, cue_params in exercise_config.form_cues.items():
                                is_good, measured_angle, feedback = self.detector.check_form(img, cue_params)
                                if is_good is False:  # Explicitly check for False (not None)
                                    form_issues.append(feedback)
                        
                        self.form_feedback = ", ".join(form_issues) if form_issues else "Good form"
                        
                        # Accumulate form issues and invalidate form during active rep
                        if self.rep_stage in ["down", "up"]:
                            if form_issues:
                                self.is_rep_form_valid = False
                                for issue in form_issues:
                                    if issue not in self.current_rep_issues:
                                        self.current_rep_issues.append(issue)
                        
                        # Calculate overall confidence score based on visibility and symmetry
                        visibility_scores = [self.detector.landmark_list[p][3] for p in key_points 
                                             if p < len(self.detector.landmark_list)]
                        avg_visibility = sum(visibility_scores) / len(visibility_scores) if visibility_scores else 0
                        
                        # Combined score (70% visibility, 30% symmetry)
                        self.confidence_score = (0.7 * avg_visibility + 0.3 * symmetry_score) * 100
                        
                        # Count reps with improved detection algorithm
                        if self.is_running and self.confidence_score >= 50.0:
                            # Get elapsed time
                            if self.start_time:
                                self.elapsed_time = timedelta(seconds=int(time.time() - self.start_time))
                            
                            # Rep detection state machine
                            if percentage <= 10 and self.rep_stage != "down":
                                # Transitioning from waiting/up to down
                                if self.rep_stage == "waiting":
                                    self.rep_start_time = time.time()
                                    self.is_rep_form_valid = True
                                    self.current_rep_issues = []
                                self.rep_stage = "down"
                            elif percentage >= 40 and self.rep_stage == "down":
                                # Transitioning from down to up (moving upwards)
                                self.rep_stage = "up"
                            elif percentage >= 90 and self.rep_stage == "up":
                                current_time = time.time()
                                # Temporal debouncing (min 0.8 seconds)
                                if self.rep_start_time and (current_time - self.rep_start_time >= 0.8):
                                    if self.is_rep_form_valid:
                                        self.count += 1
                                        # Store rep data for analysis
                                        self.rep_history.append({
                                            "time": str(self.elapsed_time),
                                            "confidence": self.confidence_score,
                                            "form_issues": [],
                                            "valid": True
                                        })
                                        self.form_feedback = "Good rep!"
                                    else:
                                        # Store invalid rep data
                                        self.rep_history.append({
                                            "time": str(self.elapsed_time),
                                            "confidence": self.confidence_score,
                                            "form_issues": self.current_rep_issues.copy(),
                                            "valid": False
                                        })
                                        self.form_feedback = f"Rep discarded: {', '.join(self.current_rep_issues)}"
                                    
                                    # Reset rep state
                                    self.rep_stage = "waiting"
                                    self.rep_start_time = None
                                else:
                                    # Too fast (noise/jitter) - reject and reset state machine to prevent delayed counts
                                    self.rep_stage = "waiting"
                                    self.rep_start_time = None
                                    self.is_rep_form_valid = True
                                    self.current_rep_issues = []
                    
                    # Draw exercise feedback
                    self.draw_exercise_feedback(img, percentage, smoothed_angle)
            else:
                self.form_feedback = "No person detected"
                self.confidence_score = 0.0
            
            # Draw UI elements
            self.draw_ui_elements(img, fps)
            
            # Calculate average confidence, valid and invalid reps from history
            valid_reps = sum(1 for rep in self.rep_history if rep.get("valid", True))
            invalid_reps = sum(1 for rep in self.rep_history if not rep.get("valid", True))
            avg_conf = sum(rep["confidence"] for rep in self.rep_history) / len(self.rep_history) if self.rep_history else self.confidence_score
            
            # Update global state
            global_state.count = int(self.count)
            global_state.exercise_type = self.exercise_type
            global_state.is_running = self.is_running
            global_state.elapsed_time = str(self.elapsed_time).split('.')[0]
            global_state.status = "RUNNING" if self.is_running else "PAUSED"
            global_state.confidence_score = self.confidence_score
            global_state.form_feedback = self.form_feedback
            global_state.average_confidence = avg_conf
            global_state.valid_reps = valid_reps
            global_state.invalid_reps = invalid_reps
            global_state.rep_stage = self.rep_stage
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            cv2.putText(img, "Error processing frame", (10, h//2),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        return img
        
    def draw_exercise_feedback(self, img, percentage, angle):
        """
        Draw exercise-specific feedback on frame
        
        Args:
            img: Input image
            percentage: Exercise completion percentage
            angle: Current angle
        """
        h, w, c = img.shape
        
        # Draw progress bar
        bar_color = (0, 255, 0) if self.is_running else (0, 165, 255)
        cv2.rectangle(img, (w-200, 40), (w-40, 70), (255, 255, 255), 2)
        filled_width = int(160 * (percentage / 100))
        cv2.rectangle(img, (w-200, 40), (w-200 + filled_width, 70), bar_color, cv2.FILLED)
        cv2.putText(img, f"{int(percentage)}%", (w-190, 65),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
        # Draw form feedback
        if self.form_feedback:
            feedback_color = (0, 255, 0) if self.form_feedback == "Good form" else (0, 0, 255)
            cv2.putText(img, self.form_feedback, (10, h-30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, feedback_color, 2)
        
        # Draw confidence score
        confidence_color = (0, 255, 0) if self.confidence_score > 80 else \
                          (0, 165, 255) if self.confidence_score > 60 else (0, 0, 255)
        cv2.putText(img, f"Detection: {int(self.confidence_score)}%", (10, h-10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, confidence_color, 2)
        
        # Add rep stage indicator
        stage_color = (0, 255, 0) if self.rep_stage == "up" else \
                     (0, 165, 255) if self.rep_stage == "down" else (255, 255, 255)
        cv2.putText(img, f"Stage: {self.rep_stage.upper()}", (w-200, h-10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, stage_color, 2)
    
    def draw_ui_elements(self, img, fps):
        """
        Draw UI elements on the frame
        
        Args:
            img: Input image
            fps: Current frames per second
        """
        h, w, c = img.shape
        
        # Exercise type
        display_type = "BICEP CURL" if self.exercise_type == "curlup" else self.exercise_type.upper()
        cv2.putText(img, f'Exercise: {display_type}', (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
        
        # Rep counter with larger font
        cv2.putText(img, f'Reps: {int(self.count)}', (10, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
        
        # Timer
        time_str = str(self.elapsed_time).split('.')[0]
        cv2.putText(img, f'Time: {time_str}', (10, 110),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
        
        # Status with colored indicator
        status = "RUNNING" if self.is_running else "PAUSED"
        status_color = (0, 255, 0) if self.is_running else (0, 0, 255)
        cv2.putText(img, status, (w - 150, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, status_color, 2)
        
        # FPS counter (smaller and in corner)
        cv2.putText(img, f'FPS: {int(fps)}', (w - 100, h - 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    def toggle_start_stop(self):
        """Toggle between start and stop states"""
        self.is_running = not self.is_running
        if self.is_running:
            if self.start_time is None:
                self.start_time = time.time()
            else:
                # Adjust start time to account for pause time
                pause_duration = time.time() - (self.start_time + self.elapsed_time.total_seconds())
                self.start_time += pause_duration
        logger.info(f"Exercise tracking {'started' if self.is_running else 'paused'}")
    
    def reset(self):
        """Reset tracking state"""
        self.count = 0
        self.dir = 0
        self.elapsed_time = timedelta(0)
        self.start_time = time.time() if self.is_running else None
        self.rep_history = []
        self.position_buffer = []
        self.rep_stage = "waiting"
        self.rep_start_time = None
        self.is_rep_form_valid = True
        self.current_rep_issues = []
        self.form_feedback = "Waiting to detect form..."
        logger.info("Exercise tracking reset")
    
    def change_exercise(self, exercise_type):
        """
        Change the current exercise type
        
        Args:
            exercise_type: New exercise type
        """
        if exercise_type in EXERCISE_CONFIGS:
            self.exercise_type = exercise_type
            # Reset tracking state for new exercise
            self.reset()
            logger.info(f"Exercise changed to {exercise_type}")
        else:
            logger.warning(f"Invalid exercise type: {exercise_type}")
    
    def toggle_debug(self):
        """Toggle debug visualization mode"""
        self.display_debug = not self.display_debug
        logger.info(f"Debug mode {'enabled' if self.display_debug else 'disabled'}")
    
    def get_exercise_stats(self):
        """Get statistics about the current exercise session"""
        return {
            "count": int(self.count),
            "time": str(self.elapsed_time).split('.')[0],
            "exercise_type": self.exercise_type,
            "avg_confidence": sum([rep["confidence"] for rep in self.rep_history]) / len(self.rep_history) if self.rep_history else 0,
            "rep_history": self.rep_history
        }

def generate_frames():
    """Generator function to yield video frames"""
    cap = cv2.VideoCapture(0)
    # Set resolution to improve performance
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    tracker = FitnessTracker()
    
    try:
        while True:
            # Check for commands in the queue
            try:
                command = command_queue.get_nowait()
                if command == "start_stop":
                    tracker.toggle_start_stop()
                elif command == "reset":
                    tracker.reset()
                elif command == "toggle_debug":
                    tracker.toggle_debug()
                elif command.startswith("exercise_"):
                    exercise_type = command.split("_")[1]
                    tracker.change_exercise(exercise_type)
            except queue.Empty:
                pass
            
            # Read frame
            success, frame = cap.read()
            if not success:
                logger.error("Failed to capture frame")
                # Generate blank frame
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, "Camera Error", (200, 240),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Process the frame
            processed_frame = tracker.process_frame(frame)
            
            # Store the frame globally
            global global_frame
            global_frame = processed_frame
            
            # Convert to JPEG for streaming
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            if not ret:
                continue
                
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                  b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    except Exception as e:
        logger.error(f"Error in frame generation: {e}")
    finally:
        cap.release()

# Flask Routes
@app.route('/')
def index():
    """Render main application page"""
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_stop')
def start_stop():
    """API endpoint to start/stop exercise tracking"""
    command_queue.put("start_stop")
    return jsonify({"status": "success"})

@app.route('/reset')
def reset():
    """API endpoint to reset exercise tracking"""
    command_queue.put("reset")
    return jsonify({"status": "success"})

@app.route('/toggle_debug')
def toggle_debug():
    """API endpoint to toggle debug visualization"""
    command_queue.put("toggle_debug")
    return jsonify({"status": "success"})

@app.route('/exercise/<exercise_type>')
def change_exercise(exercise_type):
    """API endpoint to change exercise type"""
    if exercise_type in EXERCISE_CONFIGS:
        command_queue.put(f"exercise_{exercise_type}")
        return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Invalid exercise type"})

@app.route('/get_state')
def get_state():
    """API endpoint to get current state"""
    return jsonify(asdict(global_state))

@app.route('/get_stats')
def get_stats():
    """API endpoint to get exercise statistics"""
    # This would need to be modified to access tracker's stats
    return jsonify({
        "count": global_state.count,
        "time": global_state.elapsed_time,
        "exercise_type": global_state.exercise_type,
        "confidence_score": global_state.confidence_score,
        "form_feedback": global_state.form_feedback
    })

@app.route('/available_exercises')
def available_exercises():
    """API endpoint to get available exercises"""
    return jsonify({
        "exercises": list(EXERCISE_CONFIGS.keys())
    })

def create_templates():
    """Create templates directory and HTML file"""
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # Check if templates/index.html already exists to avoid overwriting custom modifications
    if os.path.exists('templates/index.html'):
        logger.info("templates/index.html already exists, skipping template generation to preserve styling.")
        return
        
    with open('templates/index.html', 'w') as f:
        f.write('''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PulseAI - Live Motion Tracking</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #FF6B00;
            --primary-glow: rgba(255, 107, 0, 0.15);
            --accent: #FFFFFF;
            --accent-glow: transparent;
            --bg: #0A0A0A;
            --surface: #171717;
            --border: #262626;
            
            --success: #FFFFFF;
            --warning: #FF6B00;
            --danger: #ef4444;
            --text-main: #FFFFFF;
            --text-muted: #71717a;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }
        
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 24px;
            position: relative;
            z-index: 10;
        }
        
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #0A0A0A;
            border-bottom: 1px solid var(--border);
            padding: 20px 24px;
            margin-bottom: 32px;
        }
        
        .logo-text {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 1.5px;
            color: var(--text-main);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .logo-text span {
            color: var(--primary);
        }
        
        .header-status {
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #171717;
            border: 1px solid var(--border);
            padding: 6px 14px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.5px;
            color: var(--text-muted);
        }

        .pulse-dot {
            width: 8px;
            height: 8px;
            background-color: var(--primary);
            border-radius: 50%;
            animation: pulse-animation 1.5s infinite;
        }

        @keyframes pulse-animation {
            0% { transform: scale(0.95); opacity: 1; }
            70% { transform: scale(1.1); opacity: 0.5; }
            100% { transform: scale(0.95); opacity: 1; }
        }
        
        .content-wrapper {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        
        @media (min-width: 992px) {
            .content-wrapper {
                flex-direction: row;
            }
            .video-column {
                flex: 7;
            }
            .controls-column {
                flex: 3;
            }
        }
        
        .video-column {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .video-container {
            position: relative;
            background-color: #000000;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--border);
            aspect-ratio: 16/9;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .video-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .video-overlay-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(10, 10, 10, 0.85);
            border: 1px solid var(--border);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 6px;
            letter-spacing: 0.5px;
        }
        
        .controls-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .panel {
            background-color: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            position: relative;
        }

        .panel-header {
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .panel-title {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: var(--text-main);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .panel-title i {
            color: var(--primary);
        }

        .status-badge {
            font-size: 10px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 4px;
            letter-spacing: 0.5px;
            border: 1px solid var(--border);
            background: #0A0A0A;
            color: var(--text-muted);
        }

        .status-badge.active {
            color: var(--primary);
            border-color: var(--primary);
        }
        
        .controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        button {
            padding: 12px 16px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            border: 1px solid var(--border);
            border-radius: 8px;
            background-color: #0A0A0A;
            color: var(--text-main);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        button:hover {
            border-color: #71717a;
            background-color: #1f1f1f;
        }
        
        .btn-start-stop {
            grid-column: span 2;
            background: var(--primary);
            color: white;
            border: none;
            font-weight: 800;
            letter-spacing: 0.5px;
        }

        .btn-start-stop:hover {
            background: #e05e00;
        }
        
        .btn-start-stop.running {
            background: var(--danger);
        }

        .btn-start-stop.running:hover {
            background: #c92235;
        }
        
        .btn-reset {
            background-color: #0A0A0A;
            border: 1px solid var(--border);
            color: var(--text-main);
        }

        .btn-reset:hover {
            background-color: #1f1f1f;
        }
        
        .btn-debug {
            background-color: #0A0A0A;
            border: 1px solid var(--border);
            color: var(--text-muted);
        }

        .btn-debug:hover {
            background-color: #1f1f1f;
            color: var(--text-main);
        }
        
        .stat {
            text-align: left;
            background: #0A0A0A;
            border: 1px solid var(--border);
            padding: 20px;
            border-radius: 12px;
            position: relative;
        }
        
        .stat-value {
            font-size: 72px;
            font-weight: 900;
            line-height: 1;
            margin: 8px 0;
            color: var(--text-main);
            letter-spacing: -2px;
        }

        .stat-value.highlight {
            color: #FFFFFF;
        }
        
        .stat-label {
            font-size: 10px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        .capsules-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 16px;
        }

        .capsule {
            background: #0A0A0A;
            border: 1px solid var(--border);
            padding: 12px;
            border-radius: 999px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .capsule-label {
            font-size: 8px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
        }

        .capsule-value {
            font-size: 14px;
            font-weight: 800;
            color: #FFFFFF;
            text-transform: uppercase;
        }
        
        .progress-container {
            margin-top: 20px;
            background: #0A0A0A;
            border: 1px solid var(--border);
            padding: 14px;
            border-radius: 12px;
        }
        
        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .progress-bar {
            height: 4px;
            background-color: #262626;
            border-radius: 99px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: #FFFFFF;
            border-radius: 99px;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .feedback {
            margin-top: 16px;
            padding: 14px 18px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            background-color: #0A0A0A;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .feedback::before {
            content: "\f10c";
            font-family: "Font Awesome 5 Free";
            font-weight: 900;
            font-size: 14px;
        }
        
        .feedback.good {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: #FFFFFF;
            color: #FFFFFF;
        }

        .feedback.good::before {
            content: "\f058";
            color: #FFFFFF;
        }
        
        .feedback.bad {
            background-color: rgba(255, 107, 0, 0.05);
            border-color: var(--primary);
            color: var(--primary);
            animation: shake 0.5s ease-in-out;
        }

        .feedback.bad::before {
            content: "\f06a";
            color: var(--primary);
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-4px); }
            40%, 80% { transform: translateX(4px); }
        }
        
        .exercise-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .exercise-card {
            padding: 14px;
            border-radius: 12px;
            background-color: #0A0A0A;
            border: 1px solid var(--border);
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .exercise-card:hover {
            border-color: #71717a;
            color: var(--text-main);
            background-color: #121212;
        }
        
        .exercise-card.active {
            background: #FFFFFF;
            border-color: #FFFFFF;
            color: #0A0A0A;
            box-shadow: none;
        }

        .exercise-card i {
            font-size: 16px;
            opacity: 0.8;
        }

        .exercise-card.active i {
            opacity: 1;
        }
        
        footer {
            text-align: center;
            margin-top: 40px;
            padding: 16px 0;
            color: var(--text-muted);
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-top: 1px solid var(--border);
        }

        /* Summary Modal Styling */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-overlay.open {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-content {
            background: #171717;
            border: 1px solid var(--border);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
            border-radius: 16px;
            width: 90%;
            max-width: 440px;
            padding: 32px;
            transform: scale(0.95);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            text-align: center;
        }

        .modal-overlay.open .modal-content {
            transform: scale(1);
        }

        .modal-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background-color: #0A0A0A;
            border: 1px solid var(--border);
            color: var(--primary);
            font-size: 10px;
            font-weight: 800;
            border-radius: 4px;
            text-transform: uppercase;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
        }

        .modal-content h2 {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: var(--text-main);
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .modal-content p {
            font-size: 12px;
            color: var(--text-muted);
            margin-bottom: 24px;
        }

        .modal-summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 28px;
        }

        .modal-summary-item {
            background: #0A0A0A;
            border: 1px solid var(--border);
            padding: 16px;
            border-radius: 12px;
            text-align: center;
        }

        .modal-summary-item .item-label {
            display: block;
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            margin-bottom: 6px;
        }

        .modal-summary-item .item-value {
            font-size: 18px;
            font-weight: 900;
            color: var(--text-main);
        }

        .modal-summary-item .text-orange {
            color: var(--primary);
        }

        .modal-summary-item .text-green {
            color: #FFFFFF;
        }

        .modal-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .btn-modal-primary {
            background: var(--primary);
            color: white;
            border: none;
            font-weight: 800;
            padding: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-modal-primary:hover {
            background: #e05e00;
        }

        .btn-modal-secondary {
            background: #0A0A0A;
            border: 1px solid var(--border);
            color: var(--text-main);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-modal-secondary:hover {
            background-color: #171717;
            border-color: #71717a;
        }
        
        @media (max-width: 768px) {
            .controls {
                grid-template-columns: 1fr;
            }
            
            .btn-start-stop {
                grid-column: span 1;
            }
            
            .capsules-container {
                grid-template-columns: 1fr;
            }

            .modal-footer {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>

    <div class="container">
        <header>
            <a href="/" class="logo-text">PULSE<span>AI</span></a>
            <div class="header-status">
                <span class="pulse-dot"></span>
                <span>AI VISION LABS</span>
            </div>
        </header>
        
        <div class="content-wrapper">
            <!-- Left Camera Feed Section -->
            <div class="video-column">
                <div class="video-container">
                    <img src="{{ url_for('video_feed') }}" alt="Fitness Tracker Video Feed">
                    <div class="video-overlay-badge">
                        <span class="pulse-dot"></span>
                        <span>POSE OVERLAY CORE V1.0</span>
                    </div>
                </div>
            </div>
            
            <!-- Right Analytics Dashboard -->
            <div class="controls-column">
                <!-- Controls Panel -->
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title"><i class="fas fa-sliders-h"></i> System Controls</h2>
                        <span id="status" class="status-badge">PAUSED</span>
                    </div>
                    <div class="controls">
                        <button id="startStopBtn" class="btn-start-stop">
                            <i class="fas fa-play"></i> Start Tracking
                        </button>
                        <button id="resetBtn" class="btn-reset">
                            <i class="fas fa-redo"></i> Reset Session
                        </button>
                        <button id="debugBtn" class="btn-debug">
                            <i class="fas fa-bug"></i> Debug Mode
                        </button>
                    </div>
                </div>
                
                <!-- Performance Statistics Panel -->
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title"><i class="fas fa-chart-bar"></i> Analytics Console</h2>
                    </div>
                    
                    <div class="stat">
                        <div class="stat-label">Repetitions</div>
                        <div class="stat-value highlight" id="rep-count">0</div>
                    </div>
                    
                    <div class="capsules-container">
                        <div class="capsule">
                            <span class="capsule-label">Duration</span>
                            <span class="capsule-value font-mono" id="elapsed-time">00:00:00</span>
                        </div>
                        <div class="capsule">
                            <span class="capsule-label">Stage</span>
                            <span class="capsule-value" id="rep-stage">waiting</span>
                        </div>
                    </div>
                    
                    <div class="progress-container">
                        <div class="progress-label">
                            <span>Keypoint Visibility Confidence</span>
                            <span id="confidence-value">0%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="confidence-bar" style="width: 0%"></div>
                        </div>
                    </div>
                    
                    <div class="feedback" id="form-feedback">
                        Position yourself in front of the camera...
                    </div>
                </div>
                
                <!-- Exercise Gating Panel -->
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title"><i class="fas fa-dumbbell"></i> Active Exercise</h2>
                    </div>
                    <div class="exercise-list" id="exercise-list">
                        <div class="exercise-card active" data-exercise="pushup">
                            <i class="fas fa-running"></i>
                            <span>Push-up</span>
                        </div>
                        <div class="exercise-card" data-exercise="situp">
                            <i class="fas fa-chair"></i>
                            <span>Sit-up</span>
                        </div>
                        <div class="exercise-card" data-exercise="curlup">
                            <i class="fas fa-dumbbell"></i>
                            <span>Bicep Curl</span>
                        </div>
                        <div class="exercise-card" data-exercise="squat">
                            <i class="fas fa-accessibility"></i>
                            <span>Squat</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <footer>
            &copy; 2026 PulseAI Premium Tracker - Motion Intelligence Core API
        </footer>
    </div>

    <!-- Workout Completion Summary Modal -->
    <div id="summaryModal" class="modal-overlay">
        <div class="modal-content">
            <span class="modal-badge"><i class="fas fa-award"></i> Session Synced</span>
            <h2>Workout Complete</h2>
            <p>Your workout stats have been evaluated and safely saved to MongoDB.</p>
            
            <div class="modal-summary-grid">
                <div class="modal-summary-item">
                    <span class="item-label">Exercise</span>
                    <span class="item-value" id="modal-exercise">Push-up</span>
                </div>
                <div class="modal-summary-item">
                    <span class="item-label">Reps Completed</span>
                    <span class="item-value text-orange" id="modal-reps">0</span>
                </div>
                <div class="modal-summary-item">
                    <span class="item-label">Avg Accuracy</span>
                    <span class="item-value text-green" id="modal-accuracy">100%</span>
                </div>
                <div class="modal-summary-item">
                    <span class="item-label">Duration</span>
                    <span class="item-value font-mono" id="modal-duration">00:00</span>
                </div>
            </div>
            
            <div class="modal-footer">
                <button id="modalViewAnalyticsBtn" class="btn-modal-secondary">
                    <i class="fas fa-chart-line"></i> Dashboard
                </button>
                <button id="modalNewSessionBtn" class="btn-modal-primary">
                    New Session
                </button>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Elements
            const startStopBtn = document.getElementById('startStopBtn');
            const resetBtn = document.getElementById('resetBtn');
            const debugBtn = document.getElementById('debugBtn');
            const exerciseCards = document.querySelectorAll('.exercise-card');
            const repCount = document.getElementById('rep-count');
            const elapsedTime = document.getElementById('elapsed-time');
            const statusBadge = document.getElementById('status');
            const formFeedback = document.getElementById('form-feedback');
            const confidenceBar = document.getElementById('confidence-bar');
            const confidenceValue = document.getElementById('confidence-value');
            const summaryModal = document.getElementById('summaryModal');
            
            // Start/Stop button
            startStopBtn.addEventListener('click', function() {
                fetch('/start_stop')
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.error('Error:', error));
            });
            
            // Reset button
            resetBtn.addEventListener('click', function() {
                fetch('/reset')
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.error('Error:', error));
            });
            
            // Debug button
            debugBtn.addEventListener('click', function() {
                fetch('/toggle_debug')
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.error('Error:', error));
            });
            
            // Exercise type buttons
            exerciseCards.forEach(card => {
                card.addEventListener('click', function() {
                    const exerciseType = this.getAttribute('data-exercise');
                    
                    // Remove active class from all cards
                    exerciseCards.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked card
                    this.classList.add('active');
                    
                    fetch(`/exercise/${exerciseType}`)
                        .then(response => response.json())
                        .then(data => console.log(data))
                        .catch(error => console.error('Error:', error));
                });
            });

            // Modal Button Events
            document.getElementById('modalNewSessionBtn').addEventListener('click', function() {
                summaryModal.classList.remove('open');
                fetch('/reset')
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.error('Error reset:', error));
            });

            document.getElementById('modalViewAnalyticsBtn').addEventListener('click', function() {
                window.location.href = 'http://localhost:5173/dashboard';
            });
            
            let lastSavedWorkout = null;

            function formatExerciseName(type) {
                if (!type) return "";
                if (type === "curlup" || type === "bicep_curl") return "Bicep Curl";
                if (type === "pushup") return "Push-up";
                if (type === "situp") return "Sit-up";
                if (type === "squat") return "Squat";
                return type.charAt(0).toUpperCase() + type.slice(1);
            }

            function saveWorkoutSession(state) {
                const sessionKey = `${state.exercise_type}_${state.count}_${state.elapsed_time}`;
                if (lastSavedWorkout === sessionKey) return;
                lastSavedWorkout = sessionKey;

                console.log("Saving workout session:", state);
                let displayExerciseType = state.exercise_type === "curlup" ? "bicep_curl" : state.exercise_type;

                const payload = {
                    exerciseType: displayExerciseType,
                    reps: state.count,
                    duration: state.elapsed_time,
                    averageConfidence: state.average_confidence || state.confidence_score,
                    validReps: state.valid_reps !== undefined ? state.valid_reps : state.count,
                    invalidReps: state.invalid_reps !== undefined ? state.invalid_reps : 0
                };

                // Display modal instantly with values before POST completion
                document.getElementById('modal-exercise').textContent = formatExerciseName(state.exercise_type);
                document.getElementById('modal-reps').textContent = state.count;
                const accuracy = state.count > 0 ? Math.round(((state.valid_reps !== undefined ? state.valid_reps : state.count) / state.count) * 100) : 100;
                document.getElementById('modal-accuracy').textContent = `${accuracy}%`;
                document.getElementById('modal-duration').textContent = state.elapsed_time;
                
                // Show modal overlay
                summaryModal.classList.add('open');

                fetch('http://localhost:5000/api/workouts/log', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to log workout');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Workout logged successfully to database:', data);
                })
                .catch(error => {
                    console.error('Error saving workout:', error);
                });
            }

            let previousState = null;

            // Update stats
            function updateStats() {
                fetch('/get_state')
                    .then(response => response.json())
                    .then(data => {
                        // Update rep count
                        repCount.textContent = data.count;
                        
                        // Update elapsed time
                        elapsedTime.textContent = data.elapsed_time;
                        
                        // Update status badge
                        statusBadge.textContent = data.status;
                        if (data.status === 'RUNNING') {
                            statusBadge.className = "status-badge active";
                            startStopBtn.classList.add('running');
                            startStopBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Session';
                        } else {
                            statusBadge.className = "status-badge";
                            startStopBtn.classList.remove('running');
                            startStopBtn.innerHTML = '<i class="fas fa-play"></i> Resume Tracking';
                        }
                        
                        // Update form feedback
                        formFeedback.textContent = data.form_feedback;
                        
                        // Update form feedback styling
                        if (data.form_feedback.includes("Good form") || data.form_feedback.includes("Good rep!")) {
                            formFeedback.className = "feedback good";
                        } else if (data.form_feedback.includes("Position yourself") || data.form_feedback.includes("Waiting to detect")) {
                            formFeedback.className = "feedback";
                        } else {
                            formFeedback.className = "feedback bad";
                        }
                        
                        // Update confidence bar
                        const confidenceScore = data.confidence_score;
                        confidenceBar.style.width = `${confidenceScore}%`;
                        confidenceValue.textContent = `${Math.round(confidenceScore)}%`;
                        
                        // Set confidence bar color based on score
                        if (confidenceScore > 85) {
                            confidenceBar.style.backgroundImage = 'none';
                            confidenceBar.style.backgroundColor = '#FFFFFF';
                        } else if (confidenceScore > 65) {
                            confidenceBar.style.backgroundImage = 'none';
                            confidenceBar.style.backgroundColor = 'var(--primary)';
                        } else {
                            confidenceBar.style.backgroundImage = 'none';
                            confidenceBar.style.backgroundColor = 'var(--danger)';
                        }
                        
                        // Update rep stage
                        const repStage = document.getElementById('rep-stage');
                        if (repStage) {
                            repStage.textContent = data.rep_stage;
                            if (data.rep_stage === 'down') {
                                repStage.style.color = 'var(--warning)';
                            } else if (data.rep_stage === 'up') {
                                repStage.style.color = 'var(--success)';
                            } else {
                                repStage.style.color = 'var(--text-muted)';
                            }
                        }

                        // Update exercise selection
                        exerciseCards.forEach(card => {
                            if (card.getAttribute('data-exercise') === data.exercise_type) {
                                card.classList.add('active');
                            } else {
                                card.classList.remove('active');
                            }
                        });

                        // --- Automatic Session Persistence ---
                        if (previousState) {
                            if (previousState.status === 'RUNNING' && data.status === 'PAUSED' && previousState.count > 0) {
                                saveWorkoutSession(previousState);
                            }
                            else if ((previousState.exercise_type !== data.exercise_type || (previousState.count > 0 && data.count === 0)) && previousState.count > 0) {
                                saveWorkoutSession(previousState);
                            }
                        }
                        
                        previousState = data;
                    })
                    .catch(error => console.error('Error fetching state:', error));
            }
            
            // Update stats every second
            setInterval(updateStats, 1000);
            
            // Initial update
            updateStats();
            
            // Fetch available exercises from backend
            fetch('/available_exercises')
                .then(response => response.json())
                .then(data => {
                    console.log("Available exercises:", data);
                })
                .catch(error => console.error('Error fetching exercises:', error));
        });
    </script>
</body>
</html>''')

if __name__ == '__main__':
    # Create templates directory and index.html
    create_templates()
    
    # Log startup information
    logger.info("Starting ML Fitness Tracker application")
    logger.info(f"Available exercises: {', '.join(EXERCISE_CONFIGS.keys())}")
    
    # Start the Flask app
    app.run(debug=True, host='0.0.0.0', port=5001)