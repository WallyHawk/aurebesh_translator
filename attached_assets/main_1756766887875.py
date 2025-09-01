import os, json
print("OPENAI_API_KEY =", os.getenv("OPENAI_API_KEY"))

from kivy.metrics import dp
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.anchorlayout import AnchorLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.dropdown import DropDown
from kivy.uix.label import Label
from kivy.uix.modalview import ModalView
from kivy.uix.slider import Slider
from kivy.uix.togglebutton import ToggleButton
from kivy.uix.scrollview import ScrollView
from kivy.core.window import Window
from kivy.core.clipboard import Clipboard
from kivy.clock import Clock
from kivy.graphics import Color, Rectangle, Line
import unicodedata, json, os, webbrowser
from datetime import datetime
from kivy.uix.filechooser import FileChooserIconView
from threading import Thread
from kivy.uix.widget import Widget
from kivy.uix.progressbar import ProgressBar
from kivy.animation import Animation
from kivy.core.audio import SoundLoader


# -----------------------------
# Fixed Icon Button Class (48x48dp)
# -----------------------------
class FixedIconButton(Button):
    def __init__(self, **kwargs):
        kwargs.setdefault('size_hint', (None, None))
        kwargs.setdefault('size', (dp(48), dp(48)))
        super().__init__(**kwargs)
        self.background_normal = ''

# -----------------------------
# Main Icon Button with Active State Behavior
# -----------------------------
def hex_to_rgba(hex_color, alpha=1):
    hex_color = hex_color.lstrip('#')
    lv = len(hex_color)
    if lv == 6:
        r, g, b = tuple(int(hex_color[i:i+2], 16) for i in range(0, 6, 2))
    elif lv == 3:
        r, g, b = tuple(int(hex_color[i]*2, 16) for i in range(0, 3))
    else:
        r, g, b = (0, 0, 0)
    return (r/255, g/255, b/255, alpha)

MAIN_BTN_NORMAL = lambda: hex_to_rgba("e5703d")
MAIN_BTN_ACTIVE = lambda: hex_to_rgba("dd4e1e")

class MainIconButton(FixedIconButton):
    def __init__(self, **kwargs):
        self.normal_color = kwargs.pop('normal_color', MAIN_BTN_NORMAL())
        self.active_color = kwargs.pop('active_color', MAIN_BTN_ACTIVE())
        super().__init__(**kwargs)
        self.background_color = self.normal_color

    def on_press(self):
        self.background_color = self.active_color
        return super().on_press()

    def on_release(self):
        self.background_color = self.normal_color
        return super().on_release()

# -----------------------------
# VIEW_MODES: Color schemes per view.
# -----------------------------
VIEW_MODES = {
    "Rebel": {
         "bg": hex_to_rgba("f0ece1"),
         "container": hex_to_rgba("3b444b"),
         "label": hex_to_rgba("080808"),
         "input_text": hex_to_rgba("f0ece1"),
         "accent": hex_to_rgba("dd4e1e"),
         "icon_normal": hex_to_rgba("e5703d"),
         "icon_active": hex_to_rgba("dd4e1e")
    },
    "Imperial": {
         "bg": hex_to_rgba("3B444B"),
         "container": hex_to_rgba("080808"),
         "label": hex_to_rgba("9c1b1b"),
         "input_text": hex_to_rgba("F0ECE1"),
         "accent": hex_to_rgba("D63333"),
         "icon_normal": hex_to_rgba("9c1b1b"),
         "icon_active": hex_to_rgba("D63333")
    },
    "Light Side": {  # formerly Jedi
         "bg": hex_to_rgba("998b71"),
         "container": hex_to_rgba("3b444b"),
         "label": hex_to_rgba("90caff"),
         "input_text": hex_to_rgba("c4ac8b"),
         "accent": hex_to_rgba("90f3b7"),
         "icon_normal": hex_to_rgba("90caff"),
         "icon_active": hex_to_rgba("90f3b7")
    },
    "Dark Side": {   # formerly Sith
         "bg": hex_to_rgba("242424"),
         "container": hex_to_rgba("000000"),
         "label": hex_to_rgba("ff0000"),
         "input_text": hex_to_rgba("F0ECE1"),
         "accent": hex_to_rgba("dfdfdf"),
         "icon_normal": hex_to_rgba("ff0000"),
         "icon_active": hex_to_rgba("2d2b3c")
    },
    "Bounty Hunter": {
         "bg": hex_to_rgba("a6918d"),
         "container": hex_to_rgba("16071a"),
         "label": hex_to_rgba("fff8f1"),
         "input_text": hex_to_rgba("aaaaaa"),
         "accent": hex_to_rgba("889273"),
         "icon_normal": hex_to_rgba("889273"),  # updated from "aaaaaa" to "889273"
         "icon_active": hex_to_rgba("889273")
    }
}
CURRENT_VIEW = "Rebel"
Window.clearcolor = VIEW_MODES[CURRENT_VIEW]["bg"]

# -----------------------------
# Helper: Draw blue border when focused.
# -----------------------------
def update_border(widget, focused):
    widget.canvas.after.clear()
    if focused:
        with widget.canvas.after:
            Color(0, 0, 1, 1)
            Line(rectangle=(widget.x, widget.y, widget.width, widget.height), width=dp(2))

# -----------------------------
# Helper: Compute a contrasting text color
# -----------------------------
def get_contrasting_color(rgba):
    r, g, b, _ = rgba
    luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return (0, 0, 0, 1) if luminance > 0.5 else (1, 1, 1, 1)

# -----------------------------
# Define Ligatures and Mappings
# -----------------------------
ligatures = {
    "ch": "\ue011",
    "sh": "\ue016",
    "th": "\ue018",
    "ae": "\ue010",
    "eo": "\ue012",
    "kh": "\ue013",
    "oo": "\ue015",
    "ng": "\ue014"
}

def english_to_aurebesh(text):
    text = text.lower()
    result = ""
    i = 0
    while i < len(text):
        if i < len(text)-1 and text[i:i+2] in ligatures:
            result += ligatures[text[i:i+2]]
            i += 2
        else:
            result += text[i].upper()
            i += 1
    return result

def aurebesh_to_english(text):
    result = ""
    for char in text:
        norm_char = unicodedata.normalize('NFC', char)
        cp = ord(norm_char)
        matched = False
        for lig, glyph in ligatures.items():
            if cp == ord(glyph):
                result += lig
                matched = True
                break
        if not matched:
            result += norm_char.lower()
    return result

# -----------------------------
# Persistent Storage for Saved Phrases and History
# -----------------------------
preset_phrases = [
  "May the Force be with you",
  "I have a bad feeling about this",
  "Do. Or do not. There is no try.",
  "This is the way",
  "Use the Force, Luke.",
  "Help me, Obi-Wan Kenobi. You’re my only hope.",
  "These aren’t the droids you’re looking for.",
  "I find your lack of faith disturbing.",
  "The Force will be with you. Always.",
  "Never tell me the odds!",
  "It’s a trap!",
  "In my experience, there's no such thing as luck.",
  "Stay on target.",
  "I am your father.",
  "I will not be the last Jedi.",
  "Rebellions are built on hope.",
  "I am one with the Force. The Force is with me.",
  "I feel the good in you, the conflict.",
  "Your eyes can deceive you; don’t trust them.",
  "The circle is now complete.",
  "Remember, the Force will be with you, always.",
  "Now this is podracing!",
  "You were the chosen one!",
  "I have the highground",
  "You’ve taken your first step into a larger world.",
  "Only a Sith deals in absolutes.",
  "Power! Unlimited power!",
  "I’m altering the deal. Pray I don’t alter it any further.",
  "Why, you stuck-up, half-witted, scruffy-looking nerf herder!",
  "I suggest a new strategy, R2. Let the Wookiee win.",
  "Truly wonderful, the mind of a child is.",
  "I am a Jedi, like my father before me.",
  "You don’t know the power of the dark side!",
  "Chewie, we’re home.",
  "I’ll never turn to the dark side.",
  "I’ve been waiting for you, Obi-Wan.",
  "I’ve got a bad feeling about this.",
  "I want to go home and rethink my life.",
  "That’s no moon. It’s a space station.",
  "You don’t believe in the Force, do you?",
  "Mind tricks don’t work on me.",
  "I’m just a simple man trying to make my way in the universe.",
  "Fear leads to anger. Anger leads to hate. Hate leads to suffering.",
  "We take them together.",
  "Light the fire.",
  "It’s not about lifting rocks.",
  "You know, sometimes I amaze even myself.",
  "This deal is getting worse all the time.",
  "It’s like poetry, it rhymes.",
  "The Force is strong with this one.",
  "Let the Wookiee win.",
  "Don’t get cocky.",
  "Somebody has to save our skins.",
  "Clearly the kid is the brains of the operation.",
  "Understanding you does not mean I agree with you.",
  "Oh, I'm confident, I'm just not stupid.",
  "Good soldiers follow orders.",
  "This Is on You Now. This Is Like Skin.",
  "You've Become More Than Your Fear.",
  "That Ends Today! There Is One Way Out.",
  "The Empire Is a Disease That Thrives in Darkness.",
  "We're the Rhydo, Kid. We're the Fuel.",
  "Remember This: Try.",
  "The Death of Truth Is the Ultimate Victory of Evil.",
  "I Burn My Life to Make a Sunrise That I Know I'll Never See.",
  "Tyranny requires constant effort.",
  "So this is how liberty dies. With Thunderous applause.",
  "Your focus determines your reality.",
  "There's always a bigger fish.",
  "Fear is the path to the dark side.",
  "Luminous beings are we, not this crude matter.",
  "The greatest teacher, failure is.",
  "We are what they grow beyond.",
  "Adventure. Excitement. A jedi craves not these things.",
  "You must unlearn what you have learned.",
  "To defeat an enemy, you must know them.",
  "Be careful not to choke on your aspirations.",
  "This will be a day long remembered.",
  "The Force, the Jedi. All of it. It's all true.",
  "I am no Jedi, but I know the Force.",
  "An elegant weapon for a more civilized age.",

]


SAVED_PHRASES_FILE = os.path.join(os.path.dirname(__file__), "saved_phrases.json")
def load_saved_phrases():
    try:
        with open(SAVED_PHRASES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print("No saved phrases found:", e)
        return []
def save_phrases_to_file(phrases):
    try:
        with open(SAVED_PHRASES_FILE, "w", encoding="utf-8") as f:
            json.dump(phrases, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Error saving phrases:", e)
saved_phrases = load_saved_phrases()
def get_all_phrases():
    return preset_phrases + saved_phrases

UNLOCKED_TIERS_FILE = os.path.join(os.path.dirname(__file__), "unlocked_tiers.json")

def load_unlocked_tiers():
    try:
        with open(UNLOCKED_TIERS_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f).get("tiers", [1]))
    except:
        return {1}

def save_unlocked_tiers(tiers_set):
    try:
        with open(UNLOCKED_TIERS_FILE, "w", encoding="utf-8") as f:
            json.dump({"tiers": sorted(tiers_set)}, f, indent=2)
    except Exception as e:
        print("Error saving unlocked tiers:", e)

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "history.json")
def load_history():
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print("No history found:", e)
        return []
def save_history(history_list):
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history_list, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Error saving history:", e)
history = load_history()
def add_history_entry(eng, aus):
    if not eng.strip():
        return
    if history and history[-1]["english"] == eng:
        return
    entry = {
        "english": eng,
        "aurebesh": aus,
        "favorite": False,
        "timestamp": datetime.now().isoformat()
    }
    history.append(entry)
    save_history(history)

import random
import string

def generate_word_search(words, size):
    # Initialize empty grid
    grid = [['' for _ in range(size)] for _ in range(size)]
    directions = [(0,1),(1,0),(1,1),(-1,1)]  # H, V, Diag down, Diag up
    placed = []

    for word in words:
        word = word.upper()
        wlen = len(word)
        placed_ok = False
        attempts = 0

        while not placed_ok and attempts < 100:
            attempts += 1
            dir_x, dir_y = random.choice(directions)
            # pick starting cell so word fits
            if dir_x == 1:
                start_x = random.randrange(0, size - wlen + 1)
            elif dir_x == -1:
                start_x = random.randrange(wlen-1, size)
            else:
                start_x = random.randrange(0, size)
            if dir_y == 1:
                start_y = random.randrange(0, size - wlen + 1)
            elif dir_y == -1:
                start_y = random.randrange(wlen-1, size)
            else:
                start_y = random.randrange(0, size)

            # check slot clear or matching letters
            can_place = True
            coords = []
            for i in range(wlen):
                x = start_x + dir_x * i
                y = start_y + dir_y * i
                existing = grid[y][x]
                if existing not in ('', word[i]):
                    can_place = False
                    break
                coords.append((x,y))
            if not can_place:
                continue

            # place the word
            for i, (x,y) in enumerate(coords):
                grid[y][x] = word[i]
            placed.append((word, coords))
            placed_ok = True

        if not placed_ok:
            raise ValueError(f"Couldn’t place word {word}")

    # fill in blanks
    for y in range(size):
        for x in range(size):
            if grid[y][x] == '':
                grid[y][x] = random.choice(string.ascii_uppercase)

    return grid, placed

# -----------------------------
# Base Class for Full-Window Pop-ups
# -----------------------------
class FullPopup(ModalView):
    """Base class for full-window pop-ups with a header bar."""
    def __init__(self, title_text, translator_widget, **kwargs):
        super().__init__(**kwargs)
        self.translator = translator_widget
        cs = self.translator.colors
        self.size_hint = (1, 1)
        self.background_color = cs["bg"]
        self.unlocked_tiers = load_unlocked_tiers()

        # Header bar (48dp high) with title and an X close button.
        header = BoxLayout(
            orientation="horizontal", 
            size_hint=(1, None), 
            height=dp(48)
        )
        
        header_title = Label(
            text=title_text,
            font_size=dp(24),
            font_name="fonts/VT323-Regular.ttf",
            color=cs["input_text"],
            halign="left",
            size_hint=(1, 1)
        )
        header_title.bind(size=lambda inst, val: setattr(inst, 'text_size', (val[0], val[1])))
        header.add_widget(header_title)
        close_btn = MainIconButton(
            text="\uf057",
            font_size=dp(24),
            normal_color=cs["icon_normal"],
            active_color=cs["icon_active"],
            font_name="fonts/icon-font.ttf",
            size_hint=(None, None),
            size=(dp(48), dp(48))
        )
        close_btn.bind(on_release=lambda x: self.dismiss())
        header.add_widget(close_btn)

        self.main_layout = BoxLayout(orientation="vertical", spacing=dp(10))
        anchor = AnchorLayout(anchor_y="top", size_hint=(1, None))
        anchor.add_widget(header)
        self.main_layout.add_widget(anchor)
        self.content_area = BoxLayout(orientation="vertical", padding=[dp(10)]*2)
        self.main_layout.add_widget(self.content_area)
        self.add_widget(self.main_layout)

# -----------------------------
# About Popup – New (with Disclaimer)
# -----------------------------
class AboutPopup(FullPopup):
    def __init__(self, translator_widget, **kwargs):
        super().__init__("About", translator_widget, **kwargs)
        cs = self.translator.colors
        content = BoxLayout(orientation="vertical", spacing=dp(10), padding=[dp(10)]*2)
        info = (
            "Imperial Remnant Podcast © 2025\n"
            "All rights reserved.\n\n"
            "This app translates English to Aurebesh for personal use only. "
            "No warranty is provided.\n\n"
            "Assets used in this app (fonts, icons, etc.) are either open source "
            "or licensed for personal use only.\n\n"
            "For more content, visit our YouTube channel:\nhttps://www.youtube.com/@imperialremnantpodcast\n\n"
            "Disclaimer: This is a fan-made app created for entertainment purposes only. "
            "It is not an official Star Wars product and is not affiliated with Lucasfilm, Disney, or any related entities."
        )
        info_label = Label(
            text=info,
            font_size=dp(20),
            font_name="fonts/VT323-Regular.ttf",
            color=cs["input_text"],
            halign="left",
            valign="middle"
        )
        info_label.bind(size=lambda inst, val: setattr(inst, 'text_size', (val[0], val[1])))
        content.add_widget(info_label)
        self.content_area.add_widget(content)

# -----------------------------
# History Popup
# -----------------------------
class HistoryPopup(FullPopup):
    def __init__(self, translator_widget, **kwargs):
        super().__init__("Translation History", translator_widget, **kwargs)
        self.populate_history()
        if self.translator.english_input.text.strip():
            add_history_entry(self.translator.english_input.text, self.translator.aurebesh_input.text)

    def populate_history(self):
        self.content_area.clear_widgets()
        cs = self.translator.colors
        scroll = ScrollView(size_hint=(1, 1))
        history_layout = BoxLayout(orientation="vertical", size_hint_y=None, spacing=dp(5), padding=[dp(10)]*2)
        history_layout.bind(minimum_height=history_layout.setter("height"))
        row_height = dp(48)
        fixed_darker = hex_to_rgba("2b3237")
        row_index = 0
        for idx in range(len(history) - 1, -1, -1):
            entry = history[idx]
            row_color = cs["container"] if row_index % 2 == 0 else fixed_darker
            row = BoxLayout(orientation="horizontal", size_hint_y=None, height=row_height, spacing=dp(5))
            with row.canvas.before:
                Color(*row_color)
                rect = Rectangle(pos=row.pos, size=row.size)
            row.bind(pos=lambda inst, val, rect=rect: setattr(rect, 'pos', inst.pos))
            row.bind(size=lambda inst, val, rect=rect: setattr(rect, 'size', inst.size))
            label = Label(
                text=entry['english'],
                size_hint_x=0.6,
                halign="left",
                valign="middle",
                color=cs["input_text"],
                font_name="fonts/VT323-Regular.ttf"
            )
            label.bind(size=lambda inst, val: setattr(inst, 'text_size', (val[0], val[1])))
            row.add_widget(label)
            copy_btn = MainIconButton(
                text="\uf0c5",
                font_size=dp(24),
                normal_color=cs["icon_normal"],
                active_color=cs["icon_active"],
                font_name="fonts/icon-font.ttf"
            )
            copy_btn.bind(on_release=lambda x, p=entry['english']: Clipboard.copy(p))
            row.add_widget(copy_btn)
            fav_btn = MainIconButton(
                text="\uf005",
                font_size=dp(24),
                normal_color=cs["icon_normal"] if entry.get("favorite", False) else (0.5, 0.5, 0.5, 1),
                active_color=cs["icon_active"],
                font_name="fonts/icon-font.ttf"
            )
            fav_btn.bind(on_release=lambda x, i=idx: self.toggle_favorite(i))
            row.add_widget(fav_btn)
            del_btn = MainIconButton(
                text="\uf1f8",
                font_size=dp(24),
                normal_color=cs["icon_normal"],
                active_color=cs["icon_active"],
                font_name="fonts/icon-font.ttf"
            )
            del_btn.bind(on_release=lambda x, i=idx: self.delete_entry(i))
            row.add_widget(del_btn)
            history_layout.add_widget(row)
            row_index += 1
        scroll.add_widget(history_layout)
        self.content_area.add_widget(scroll)

    def toggle_favorite(self, index):
        history[index]["favorite"] = not history[index].get("favorite", False)
        phrase = history[index]["english"]
        if history[index]["favorite"]:
            if phrase not in saved_phrases:
                saved_phrases.append(phrase)
                save_phrases_to_file(saved_phrases)
        else:
            if phrase in saved_phrases:
                saved_phrases.remove(phrase)
                save_phrases_to_file(saved_phrases)
        save_history(history)
        self.populate_history()

    def delete_entry(self, index):
        try:
            del history[index]
            save_history(history)
            self.populate_history()
        except IndexError:
            pass

# -----------------------------
# Saved Popup
# -----------------------------
class SavedPopup(FullPopup):
    def __init__(self, translator_widget, **kwargs):
        super().__init__("Saved Phrases", translator_widget, **kwargs)
        self.populate_saved()

    def populate_saved(self):
        self.content_area.clear_widgets()
        cs = self.translator.colors
        scroll = ScrollView(size_hint=(1, 1))
        saved_layout = BoxLayout(orientation="vertical", size_hint_y=None, spacing=dp(5), padding=[dp(10)]*2)
        saved_layout.bind(minimum_height=saved_layout.setter("height"))
        row_height = dp(48)
        fixed_darker = hex_to_rgba("2b3237")
        row_index = 0
        for phrase in saved_phrases:
            row_color = cs["container"] if row_index % 2 == 0 else fixed_darker
            row = BoxLayout(orientation="horizontal", size_hint_y=None, height=row_height, spacing=dp(5))
            with row.canvas.before:
                Color(*row_color)
                rect = Rectangle(pos=row.pos, size=row.size)
            row.bind(pos=lambda inst, val, rect=rect: setattr(rect, 'pos', inst.pos))
            row.bind(size=lambda inst, val, rect=rect: setattr(rect, 'size', inst.size))
            label = Label(
                text=phrase,
                size_hint_x=0.7,
                halign="left",
                valign="middle",
                color=cs["input_text"],
                font_name="fonts/VT323-Regular.ttf"
            )
            label.bind(size=lambda inst, val: setattr(inst, 'text_size', (val[0], val[1])))
            row.add_widget(label)
            copy_btn = MainIconButton(
                text="\uf0c5",
                font_size=dp(24),
                normal_color=cs["icon_normal"],
                active_color=cs["icon_active"],
                font_name="fonts/icon-font.ttf"
            )
            copy_btn.bind(on_release=lambda x, p=phrase: Clipboard.copy(p))
            row.add_widget(copy_btn)
            del_btn = MainIconButton(
                text="\uf1f8",
                font_size=dp(24),
                normal_color=cs["icon_normal"],
                active_color=cs["icon_active"],
                font_name="fonts/icon-font.ttf"
            )
            del_btn.bind(on_release=lambda x, p=phrase: self.delete_saved(p))
            row.add_widget(del_btn)
            saved_layout.add_widget(row)
            row_index += 1
        scroll.add_widget(saved_layout)
        self.content_area.add_widget(scroll)

    def delete_saved(self, phrase):
        if phrase in saved_phrases:
            saved_phrases.remove(phrase)
            save_phrases_to_file(saved_phrases)
            self.populate_saved()

# -----------------------------
# Settings Popup – Updated
# -----------------------------
class SettingsPopup(FullPopup):
    def __init__(self, translator_widget, **kwargs):
        super().__init__("Settings", translator_widget, **kwargs)
        cs = self.translator.colors
        content = BoxLayout(orientation="vertical", spacing=dp(10), size_hint_y=1, padding=[dp(10)]*2)
        # Font Size Row
        fs_row = BoxLayout(orientation="horizontal", size_hint=(1, None), height=dp(48), spacing=dp(10))
        fs_label = Label(
            text="Font Size:",
            size_hint=(0.4, 1),
            font_size=dp(28),
            color=cs["input_text"],
            font_name="fonts/VT323-Regular.ttf",
            valign="middle"
        )
        fs_label.bind(size=lambda inst, val: setattr(inst, 'text_size', (val[0], val[1])))
        self.fs_slider = Slider(min=18, max=72, value=self.translator.english_input.font_size if self.translator.english_input.font_size >= 18 else 32, size_hint=(0.6, 1))
        self.fs_slider.bind(value=self.on_font_size_change)
        fs_row.add_widget(fs_label)
        fs_row.add_widget(self.fs_slider)
        content.add_widget(fs_row)
        # Theme Row (renamed from View Mode)
        theme_row = BoxLayout(orientation="horizontal", size_hint=(1, None), height=dp(48), spacing=dp(10))
        theme_label = Label(
            text="Theme:",
            size_hint=(0.4, 1),
            font_size=dp(28),
            color=cs["input_text"],
            font_name="fonts/VT323-Regular.ttf",
            valign="middle"
        )
        theme_label.bind(size=lambda inst, val: setattr(inst, 'text_size', (val[0], val[1])))
        self.vm_dropdown = DropDown()
        self.vm_btn = Button(
            text=self.translator.view_mode,
            size_hint=(0.6, 1),
            background_color=cs["icon_normal"],
            background_normal="",
            color=get_contrasting_color(cs["icon_normal"]),
            font_name="fonts/VT323-Regular.ttf",
            font_size=dp(24)
        )
        self.vm_btn.bind(on_release=self.vm_dropdown.open)
        for mode in ["Rebel", "Imperial", "Light Side", "Dark Side", "Bounty Hunter"]:
            btn = Button(
                text=mode,
                size_hint_y=None,
                height=dp(48),
                background_color=cs["icon_normal"],
                background_normal="",
                color=get_contrasting_color(cs["icon_normal"]),
                font_name="fonts/VT323-Regular.ttf",
                font_size=dp(24)
            )
            btn.bind(on_release=lambda btn, mode=mode: self.select_view_mode(mode))
            self.vm_dropdown.add_widget(btn)
        theme_row.add_widget(theme_label)
        theme_row.add_widget(self.vm_btn)
        content.add_widget(theme_row)
        # Apply Row – New: Immediately apply the changes.
        apply_row = BoxLayout(orientation="horizontal", size_hint=(1, None), height=dp(48), spacing=dp(10))
        apply_btn = MainIconButton(
            text="Apply",
            font_size=dp(24),
            normal_color=cs["icon_normal"],
            active_color=cs["icon_active"],
            font_name="fonts/VT323-Regular.ttf",
            size_hint=(1, 1)
        )
        apply_btn.bind(on_release=lambda x: self.apply_theme())
        apply_row.add_widget(apply_btn)
        content.add_widget(apply_row)
        # Reset Defaults Row
        reset_row = BoxLayout(orientation="horizontal", size_hint=(1, None), height=dp(48), spacing=dp(10))
        reset_btn = MainIconButton(
            text="Reset Defaults",
            font_size=dp(24),
            normal_color=cs["icon_normal"],
            active_color=cs["icon_active"],
            font_name="fonts/VT323-Regular.ttf",
            size_hint=(1, 1)
        )
        reset_btn.bind(on_release=self.reset_defaults)
        reset_row.add_widget(reset_btn)
        content.add_widget(reset_row)
        # About Row
        about_row = BoxLayout(orientation="horizontal", size_hint=(1, None), height=dp(48), spacing=dp(10))
        about_btn = MainIconButton(
            text="About",
            font_size=dp(24),
            normal_color=cs["icon_normal"],
            active_color=cs["icon_active"],
            font_name="fonts/VT323-Regular.ttf",
            size_hint=(1, 1)
        )
        about_btn.bind(on_release=lambda x: self.open_about())
        about_row.add_widget(about_btn)
        content.add_widget(about_row)
        self.content_area.add_widget(content)

    def on_font_size_change(self, instance, value):
        new_size = int(value)
        self.translator.english_input.font_size = new_size
        self.translator.aurebesh_input.font_size = new_size

    def select_view_mode(self, mode):
        self.vm_btn.text = mode
        self.translator.view_mode = mode
        self.translator.colors = VIEW_MODES[mode]
        self.vm_dropdown.dismiss()

    def reset_defaults(self, instance):
        default_font_size = 32
        self.fs_slider.value = default_font_size
        self.translator.english_input.font_size = default_font_size
        self.translator.aurebesh_input.font_size = default_font_size
        self.translator.view_mode = "Rebel"
        self.translator.colors = VIEW_MODES["Rebel"]
        self.vm_btn.text = "Rebel"

    def open_about(self):
        about = AboutPopup(translator_widget=self.translator)
        about.open()

    def apply_theme(self):
        self.translator.apply_theme()
        self.dismiss()

# -----------------------------
# Flash‐Card Tier Definitions
# -----------------------------
TIERS = {
    # Tier 1 is single letters + digraph ligatures
    1: [chr(c) for c in range(ord('a'), ord('z')+1)] + list(ligatures.keys()),
    # Tier 2 might be simple words (you can flesh this out later)
    2: [
  "lightsaber", "blaster", "bowcaster", "thermal detonator", "ion cannon",
  "disruptor", "electrostaff", "force pike", "comlink", "datapad",

  "x-wing", "tie fighter", "millennium falcon", "star destroyer", "tie advanced",
  "snowspeeder", "podracer", "slave i", "speeder bike", "imperial shuttle",

  "luke", "leia", "han", "chewbacca", "yoda",
  "obi wan", "anakin", "vader", "palpatine", "lando",

  "wookiee", "ewok", "rodian", "twi'lek", "zabrak",
  "mon calamari", "duros", "bothan", "kashyyykian", "jawa",

  "tatooine", "coruscant", "naboo", "hoth", "endor",
  "kamino", "geonosis", "mustafar", "dagobah", "kashyyyk",

  "rebel alliance", "galactic empire", "first order", "resistance", "jedi order",
  "sith order", "bounty hunters", "clone troopers", "stormtroopers", "droids",

  "death star", "jabbas palace", "cloud city", "mos eisley", "mos espas",
  "jundland wastes", "ootini", "yavin 4", "theed palace", "hanging gardens",

  "hyperspace", "blue squadron", "gold squadron", "rogue squadron", "force sensitive",
  "holocron", "midichlorian", "lightspeed", "hyperdrive", "cantina",

  "padawan", "jedi master", "jedi knight", "sith lord", "grand moff",
  "moff", "admiral", "general", "commander", "captain",

  "u-wing", "a-wing", "b-wing", "tie interceptor", "tie bomber",
  "starfighter", "cr90 corvette", "venator class star destroyer", "mon cal amphibious cruiser", "droid control ship"
]
,
    # Tier 3 is your full preset phrases
    3: preset_phrases
}


# -----------------------------
# Games Popup
# -----------------------------
class GameSelectionPopup(ModalView):
    def __init__(self, translator_widget, **kwargs):
        super().__init__(size_hint=(0.8, 0.6), **kwargs)
        self.translator = translator_widget
        self.auto_dismiss = False   # force use of close button

        # 1) Outer vertical layout fills the popup
        layout = BoxLayout(
            orientation="vertical",
            spacing=dp(10),
            padding=[dp(10)] * 4
        )

        # 2) Spacer pushes everything else *up*
        layout.add_widget(Widget(size_hint_y=1))

        # 3) Game buttons (added bottom→top order)
        btn_search = Button(text="Word Search", size_hint_y=None, height=dp(48))
        btn_search.bind(on_release=lambda *_: (self.translator.open_word_search(), self.dismiss()))
        layout.add_widget(btn_search)

        btn_flash = Button(text="Flash-Cards", size_hint_y=None, height=dp(48))
        btn_flash.bind(on_release=lambda *_: (self.translator.open_flashcards(), self.dismiss()))
        layout.add_widget(btn_flash)

        # 4) Header with Close icon goes *last*, so it appears at the top
        header = BoxLayout(orientation="horizontal", size_hint_y=None, height=dp(48))
        header.add_widget(Widget())  # pushes close-button right
        close_btn = MainIconButton(
            text="\uf057",  # FontAwesome “X” icon
            font_size=dp(24),
            normal_color=self.translator.colors["icon_normal"],
            active_color=self.translator.colors["icon_active"],
            font_name="fonts/icon-font.ttf",
            size_hint=(None, None),
            size=(dp(48), dp(48))
        )
        close_btn.bind(on_release=lambda *_: self.dismiss())
        header.add_widget(close_btn)
        layout.add_widget(header)

        # 5) Finally, add this fully-built layout to the popup
        self.add_widget(layout)

# -----------------------------
# Flash-Card Quiz Popup
# -----------------------------
import random
from kivy.clock import Clock
from kivy.uix.gridlayout import GridLayout

class FlashCardPopup(ModalView):
    def __init__(self, translator_widget, **kwargs):
        super().__init__(size_hint=(0.9, 0.9), **kwargs)
        self.translator = translator_widget
        self.auto_dismiss = False

        # 1) Tier state (don’t load cards yet)
        self.current_tier   = 1
        self.unlocked_tiers = {1}

        # 2) Build the UI
        self.layout = BoxLayout(orientation="vertical", padding=dp(20), spacing=dp(10))
        
        # Score label (will be updated by next_card)
        self.score_lbl = Label(text="", size_hint_y=None, height=dp(30), color=(1, 1, 1, 1))
        self.layout.add_widget(self.score_lbl)

        # Progress bar
        self.progress = ProgressBar(max=1, value=0, size_hint_y=None, height=dp(80))
        self.layout.add_widget(self.progress)

        # Prompt (Aurebesh glyph)
        self.prompt = Label(
            font_name="Aurebesh-ImpRemnant.otf",
            font_size=dp(32),
            halign="center",
            valign="middle",
            size_hint_y=None,
            height=dp(100)
        )
        self.prompt.text_size = (self.prompt.width, None)
        self.prompt.bind(
            width=lambda inst, w: setattr(inst, 'text_size', (w, None))
        )

        self.layout.add_widget(self.prompt)

        # Load sounds
        self.sound_correct = SoundLoader.load('sound/ding.mp3')
        self.sound_wrong   = SoundLoader.load('sound/buzz.mp3')

        # Answer buttons grid
        btn_grid = GridLayout(cols=2, spacing=dp(10), size_hint_y=None, height=dp(200))
        self.answer_btns = []
        for _ in range(4):
            b = Button(
                font_size=dp(20),
                size_hint=(1, None),
                height=dp(48),
                background_normal='',
                background_down='',
                background_disabled_normal='',
                background_disabled_down='',
                background_color=self.translator.colors["container"],
                color=(1,1,1,1),
                disabled_color=(1,1,1,1),
                halign='center',
                valign='middle',
                text_size=(0, None)
            )
            b.bind(on_release=self.check_answer)
            self.answer_btns.append(b)
            btn_grid.add_widget(b)

            # enable text wrapping at the button’s current width
            b.text_size = (b.width, None)
            b.halign    = 'center'
            b.valign    = 'middle'
            b.bind(width=lambda inst, w: setattr(inst, 'text_size', (w, None)))

            # 1) Make the text wrap at the button’s width minus padding
            b.bind(width=lambda inst, w: setattr(inst, 'text_size', (w - dp(20), None)))

            # 2) Auto‐grow the height based on wrapped text size
            b.bind(texture_size=lambda inst, ts: setattr(inst, 'height', ts[1] + dp(20)))
        
        self.layout.add_widget(btn_grid)

        # Close button
        close = Button(text="Close", size_hint_y=None, height=dp(48))
        close.bind(on_release=lambda *_: self.dismiss())
        self.layout.add_widget(close)

        # Attach the layout
        self.add_widget(self.layout)

        # 3) Now that all widgets exist, load the first deck
        self.load_tier(self.current_tier)

    def load_tier(self, tier):
        # 1) Build & shuffle the new deck
        pool = TIERS[tier].copy()
        random.shuffle(pool)
        self.cards = pool

        # 2) Reset indices and score
        self.index = 0
        self.score = 0

        # 3) Reset progress bar to match deck size
        self.progress.max = len(self.cards)
        self.progress.value = 0

        # 4) Display the first card in the already‐built UI
        self.next_card()

    def next_card(self):
        # ——— 1) End-of-deck? show pass/fail + buttons ———
        if self.index >= len(self.cards):
            total = len(self.cards)
            pct   = self.score / total
            passed = pct >= 0.7
            status = "DIRECTIVE PASSED" if passed else "DIRECTIVE FAILED"

            # Hide the small score label and progress bar
            self.score_lbl.opacity = 0
            self.progress.opacity  = 0

            # Use the prompt label for a big summary
            self.prompt.font_name = "fonts/VT323-Regular.ttf"
            self.prompt.font_size = dp(26)
            self.prompt.text = f"SCORE: {self.score}/{total}\n{status}"

            aus_status = english_to_aurebesh(status.lower())

            # cleanup old buttons
            for w in getattr(self, 'end_buttons', []):
                try: self.layout.remove_widget(w)
                except: pass
            self.end_buttons = []            

            # compute pass/fail
            total = len(self.cards)
            status = "DIRECTIVE PASSED" if passed else "DIRECTIVE FAILED"
            pct    = self.score / len(self.cards)
            passed = pct >= 0.7

            # display definitive system report
            self.score_lbl.color = (0,1,0,1) if passed else (1,0,0,1)
            self.score_lbl.text  = f"Score: {self.score}/{total}   {status}"

            # Restart button
            restart = Button(
                text="Restart",
                size_hint_y=None, height=dp(48),
                background_normal='',
                background_color=self.translator.colors["accent"],
                color=get_contrasting_color(self.translator.colors["accent"])
            )
            restart.bind(on_release=self.restart_quiz)
            self.layout.add_widget(restart)
            self.end_buttons.append(restart)

            # Continue button
            next_tier = self.current_tier + 1
            # if they passed, unlock & persist the new tier
            if passed and next_tier in TIERS:
                self.translator.unlocked_tiers.add(next_tier)
                save_unlocked_tiers(self.translator.unlocked_tiers)
            if next_tier in TIERS:
                cont_text = f"Continue to Tier {next_tier}"
            else:
                cont_text = "Restart or Close"

            cont = Button(
                text=cont_text,
                size_hint_y=None, height=dp(48),
                background_normal='',
                background_color=self.translator.colors["accent"],
                color=get_contrasting_color(self.translator.colors["accent"])
            )
            cont.bind(on_release=self.continue_quiz)
            self.layout.add_widget(cont)
            self.end_buttons.append(cont)

            return

        # ——— 2) Otherwise, show the next card as normal ———
        # live score in white
        self.score_lbl.color = (1,1,1,1)
        self.score_lbl.text  = f"{self.score} / {len(self.cards)}"
        self.progress.value  = self.index

        eng = self.cards[self.index]
        self.prompt.text = english_to_aurebesh(eng)

        # pick & display four choices
        others = [o for o in self.cards if o != eng]
        choices = random.sample(others, 3) + [eng]
        random.shuffle(choices)
        for btn, text in zip(self.answer_btns, choices):
            btn.text             = text
            btn.background_color = self.translator.colors["container"]
            btn.color            = (1,1,1,1)
            btn.disabled         = False
            btn.opacity          = 1


    def check_answer(self, btn):
        correct = self.cards[self.index]
        container = self.translator.colors["container"]
        label_col = self.translator.colors["label"]
        green = (0, 1, 0, 1)
        red   = (1, 0, 0, 1)
        white = (1, 1, 1, 1)

        if btn.text == correct:
            self.sound_correct.play()
            Animation(
                background_color=green,
                color=white,
                duration=0.2
            ).start(btn)
            self.score += 1
        else:
            self.sound_wrong.play()
            Animation(
                background_color=red,
                color=white,
                duration=0.2
            ).start(btn)
            # highlight correct
            for b2 in self.answer_btns:
                if b2.text == correct:
                    Animation(
                        background_color=green,
                        color=white,
                        duration=0.3
                    ).start(b2)

        # disable & advance
        for b2 in self.answer_btns:
            b2.disabled = True
        self.index += 1
        Clock.schedule_once(lambda dt: self.next_card(), 0.6)

    def restart_quiz(self, *args):
        # restore prompt style
        self.prompt.font_name = "Aurebesh-ImpRemnant.otf"
        self.prompt.font_size = dp(32)
        # make the in‐quiz widgets visible again
        self.score_lbl.opacity = 1
        self.progress.opacity  = 1
        # 1) Remove both end‐of‐deck buttons
        for w in getattr(self, 'end_buttons', []):
            try:    self.layout.remove_widget(w)
            except: pass
        self.end_buttons = []

        # 2) Reset score label to default color & text
        self.score_lbl.color = self.translator.colors["label"]
        self.score_lbl.text  = ""

        # 3) Restore and show answer buttons
        for b in self.answer_btns:
            b.disabled = False
            b.opacity  = 1
            # reset their theme colors too
            b.background_color = self.translator.colors["container"]
            b.color            = self.translator.colors["label"]

        # 4) Reset progress bar
        self.progress.value = 0

        # 5) Reload the deck & show first card
        self.load_tier(self.current_tier)

    def continue_quiz(self, *args):
        # restore prompt style
        self.prompt.font_name = "Aurebesh-ImpRemnant.otf"
        self.prompt.font_size = dp(32)
        # make the in‐quiz widgets visible again
        self.score_lbl.opacity = 1
        self.progress.opacity  = 1

        # 1) Remove both end‐of‐deck buttons
        for w in getattr(self, 'end_buttons', []):
            try:    self.layout.remove_widget(w)
            except: pass
        self.end_buttons = []

        # 2) Restore answer buttons
        for b in self.answer_btns:
            b.disabled         = False
            b.opacity          = 1
            b.background_color = self.translator.colors["container"]
            b.color            = (1, 1, 1, 1)

        # 3) Advance to next tier if available
        next_tier = self.current_tier + 1
        if next_tier in TIERS:
            self.current_tier = next_tier

        # 4) Load that tier’s deck
        self.load_tier(self.current_tier)

from kivy.uix.modalview import ModalView
from kivy.uix.boxlayout  import BoxLayout
from kivy.uix.button     import Button
from kivy.metrics         import dp

class WordSearchPopup(ModalView):
    def __init__(self, words, grid_size=12, **kwargs):
        super().__init__(**kwargs)
        self.size_hint = (0.9, 0.9)
        self.words = [w.upper() for w in words]
        self.grid_size = grid_size
        self.grid, self.placed = generate_word_search(self.words, grid_size)
        self.selected = []

        # Build a single layout up front
        layout = BoxLayout(orientation='vertical', spacing=dp(8), padding=dp(8))

        # 1) Instruction icon (opens small popup)
        from kivy.uix.anchorlayout import AnchorLayout
        header = AnchorLayout(anchor_x='right', anchor_y='center',
                               size_hint_y=None, height=dp(40))
        instr_btn = Button(
            text='?', size_hint=(None,None), size=(dp(30), dp(30)),
            background_normal='', background_color=(0.9,0.9,0.5,1)
        )
        instr_btn.bind(on_release=self.show_instructions)
        header.add_widget(instr_btn)
        layout.add_widget(header)

        # 2) Grid of Aurebesh letters
        grid_layout = GridLayout(cols=grid_size, rows=grid_size, spacing=1)
        for y in range(grid_size):
            for x in range(grid_size):
                letter = self.grid[y][x]
                btn = Button(
                    text=letter,
                    font_name="Aurebesh-ImpRemnant.otf",
                    font_size=dp(24),
                    background_color=(0,0,0,0),
                    color=(1,1,1,1),
                )
                btn.bind(on_release=lambda btn, x=x, y=y: self.on_cell_tap((x,y), btn))
                grid_layout.add_widget(btn)
        layout.add_widget(grid_layout)

        # 3) Clear-selection button
        clear_btn = Button(text="Clear Selection", size_hint_y=None, height=dp(30))
        clear_btn.bind(on_release=lambda *a: self.clear_selection())
        layout.add_widget(clear_btn)

        # 4) English word list
        word_list = Label(
            text="Find: " + ", ".join(self.words),
            size_hint_y=None, height=dp(40)
        )
        layout.add_widget(word_list)

        # 5) Close button
        close = Button(text="Close", size_hint_y=None, height=dp(48))
        close.bind(on_release=lambda *a: self.dismiss())
        layout.add_widget(close)

        # 6) Attach everything
        self.add_widget(layout)

    def on_cell_tap(self, pos, btn):
        # clear any prior “first-tap” highlight
        if len(self.selected) == 1:
            prev_btn = self.selected[0][1]
            prev_btn.background_color = (1,1,1,1)

        # record & highlight this tap
        self.selected.append((pos, btn))
        btn.background_color = (1,1,0,1)  # yellow for “this is tapped”
        
        # update our “Selected:” label
        coords = [p for p,_ in self.selected]
        letters = [self.grid[y][x] for x,y in coords]
        self.selected_label.text = f"Selected: {' – '.join(letters)}"

        # once we have two taps, check correctness
        if len(self.selected) == 2:
            (x1,y1), btn1 = self.selected[0]
            (x2,y2), btn2 = self.selected[1]
            matched = False
            for word, coords in self.placed:
                if (coords[0] == (x1,y1) and coords[-1] == (x2,y2)) or \
                   (coords[-1] == (x1,y1) and coords[0] == (x2,y2)):
                    matched = True
                    # highlight the entire found word in green
                    for cx, cy in coords:
                        idx = cy * self.grid_size + cx
                        cell = grid_layout.children[self.grid_size*self.grid_size - 1 - idx]
                        cell.background_color = (0.7,1,0.7,1)
                    break

            # mark wrong taps in red
            wrong_buttons = [b for _, b in self.selected]
            for b in wrong_buttons:
                b.background_color = (1,0.7,0.7,1)
            # after 0.5s, reset them back to white
            Clock.schedule_once(
                lambda dt, btns=wrong_buttons: [setattr(btn, 'background_color', (1,1,1,1)) for btn in btns],
                0.5
            )

            # reset selection state
            self.selected = []
            self.selected_label.text = "Selected:   "
    
    def clear_selection(self):
        # reset any highlighted cells and clear state
        for _, btn in self.selected:
            btn.background_color = (1,1,1,1)
        self.selected = []

    def show_instructions(self, *args):
        from kivy.uix.modalview import ModalView
        help_popup = ModalView(size_hint=(0.6, 0.4))
        msg = Label(
            text="How to play:\nTap the first and last letter of an English word to select it.",
            halign="center", valign="middle"
        )
        msg.text_size = (help_popup.width * 0.9, None)
        help_popup.add_widget(msg)
        help_popup.open()    

        self.selected.append((pos, btn))
        if len(self.selected) == 2:
            (x1,y1), _ = self.selected[0]
            (x2,y2), _ = self.selected[1]
            # check if these coords match any placed word
            for word, coords in self.placed:
                if coords[0] == (x1,y1) and coords[-1] == (x2,y2) or \
                   coords[-1] == (x1,y1) and coords[0] == (x2,y2):
                    # highlight all letters
                    for cx, cy in coords:
                        index = cy * self.grid_size + cx
                        cell = self.children[0].children[2].children[self.grid_size*self.grid_size-1 - index]
                        cell.background_color = (0.7,1,0.7,1)
                    break
            self.selected = []

class TierSelectPopup(ModalView):
    def __init__(self, translator_widget, tiers, **kwargs):
        super().__init__(size_hint=(0.6, 0.4), **kwargs)
        self.translator = translator_widget
        layout = BoxLayout(orientation="vertical", spacing=dp(10), padding=dp(20))
        for t in tiers:
            btn = Button(text=f"Tier {t}", size_hint_y=None, height=dp(48))
            btn.bind(on_release=lambda _, tier=t: self.start_tier(tier))
            layout.add_widget(btn)
        self.add_widget(layout)

    def start_tier(self, tier):
        popup = FlashCardPopup(translator_widget=self.translator)
        popup.current_tier   = tier
        popup.unlocked_tiers = self.translator.unlocked_tiers
        popup.load_tier(tier)
        popup.open()
        self.dismiss()

# -----------------------------
# Main Translator Widget
# -----------------------------
class TranslatorWidget(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # load the set of unlocked tiers (persists across runs)
        self.unlocked_tiers = load_unlocked_tiers()
        self.orientation = "vertical"
        self.padding = [dp(10)] * 4
        self.spacing = dp(10)

        # Theme & header
        self.view_mode = "Rebel"
        self.colors = VIEW_MODES[self.view_mode]
        Window.clearcolor = self.colors["bg"]

        from kivy.uix.anchorlayout import AnchorLayout

        header = AnchorLayout(
            anchor_x="right",  # push children to the right edge
            anchor_y="center", # vertically centered
            size_hint_y=None,
            height=dp(48),
        )

        header = BoxLayout(
            orientation="horizontal",
            spacing=dp(10),
            size_hint_y=None,
            height=dp(48),
        )

        header.add_widget(Widget(size_hint_x=1))

        self.learn_btn = MainIconButton(
            text="\uf11b",
            font_size=dp(24),
            normal_color=self.colors["icon_normal"],
            active_color=self.colors["icon_active"],
            font_name="fonts/icon-font.ttf",
            size_hint=(None, None),
            size=(dp(48), dp(48))
        )

        self.learn_btn.bind(on_release=lambda _: self.open_learning())
        header.add_widget(self.learn_btn)

        self.gear_btn = MainIconButton(
            text="\uf013",
            font_size=dp(24),
            normal_color=self.colors["icon_normal"],
            active_color=self.colors["icon_active"],
            font_name="fonts/icon-font.ttf",
            size_hint=(None, None),
            size=(dp(48), dp(48))
)
        self.gear_btn.bind(on_release=lambda _: self.open_settings())
        header.add_widget(self.gear_btn)
        self.add_widget(header)

        # English input
        self.english_input = TextInput(
            hint_text="English Input", multiline=True,
            font_size=dp(18), font_name="fonts/VT323-Regular.ttf",
            size_hint_y=0.15,
            background_color=self.colors["container"],
            foreground_color=self.colors["input_text"],
            padding=[dp(10)]*4
        )
        self.english_input.bind(focus=lambda inst, val: update_border(inst, val))
        self.english_input.bind(text=self.on_english_text)
        self.add_widget(self.english_input)

        # Aurebesh input
        self.aurebesh_input = TextInput(
            hint_text="Aurebesh Translation", multiline=True,
            font_size=dp(18), font_name="Aurebesh-ImpRemnant.otf",
            size_hint_y=0.15,
            background_color=self.colors["container"],
            foreground_color=self.colors["input_text"],
            padding=[dp(10)]*4
        )
        self.aurebesh_input.bind(focus=lambda inst, val: update_border(inst, val))
        self.aurebesh_input.bind(text=self.on_aurebesh_text)
        self.aurebesh_input.input_type = 'null'  # disable system keyboard
        self.add_widget(self.aurebesh_input)

        # Action bar
        self.bottom_bar = BoxLayout(
            orientation="horizontal",
            size_hint_y=None,
            height=dp(48),
            spacing=dp(10)
        )
        for icon, handler in [
            ("\uf0c5", self.copy_active_text),
            ("\uf0ea", self.paste_text),
            ("\uf00d", self.clear_texts),
            ("\uf02e", self.open_saved_popup),
            ("\uf005", self.save_current_phrase),
            ("\uf1da", self.open_history),
        ]:
            btn = MainIconButton(
                text=icon,
                font_size=dp(24),
                normal_color=self.colors["icon_normal"],
                active_color=self.colors["icon_active"],
                font_name="fonts/icon-font.ttf",
                size_hint=(1, None),
                height=dp(48), 
            )
            btn.bind(on_release=lambda _, fn=handler: fn())
            self.bottom_bar.add_widget(btn)
        self.add_widget(self.bottom_bar)

        # Custom Aurebesh keyboard
        self.keyboard_overlay = CustomKeyboard(
            input_target=self.aurebesh_input,
            translator=self,
            size_hint_y=None,
            height=dp(200)
        )
        self.add_widget(self.keyboard_overlay)

    # Translation callbacks
    def on_english_text(self, instance, value):
        translated = english_to_aurebesh(value)
        self.aurebesh_input.unbind(text=self.on_aurebesh_text)
        self.aurebesh_input.text = translated
        self.aurebesh_input.bind(text=self.on_aurebesh_text)

    def on_aurebesh_text(self, instance, value):
        translated = aurebesh_to_english(value)
        self.english_input.unbind(text=self.on_english_text)
        self.english_input.text = translated
        self.english_input.bind(text=self.on_english_text)

    # Action handlers
    def copy_active_text(self):
        if self.english_input.focus:
            Clipboard.copy(self.english_input.text)
        elif self.aurebesh_input.focus:
            Clipboard.copy(self.aurebesh_input.text)
        else:
            Clipboard.copy(self.english_input.text)

    def paste_text(self):
        pasted = Clipboard.paste()
        # Decide target: whichever is focused, or default to English
        if self.english_input.focus:
            target = self.english_input
        elif self.aurebesh_input.focus:
            target = self.aurebesh_input
        else:
            target = self.english_input
            target.focus = True

        # Insert at current cursor position
        cursor = target.cursor_index()
        target.text = target.text[:cursor] + pasted + target.text[cursor:]
        # Move cursor to end of pasted text
        target.cursor = (cursor + len(pasted), 0)

    def clear_texts(self):
        self.english_input.text = ""
        self.aurebesh_input.text = ""

    def open_saved_popup(self):
        popup = SavedPopup(translator_widget=self)
        popup.open()

    def save_current_phrase(self):
        phrase = self.english_input.text.strip()
        if phrase and phrase not in saved_phrases:
            saved_phrases.append(phrase)
            save_phrases_to_file(saved_phrases)

    def open_history(self):
        if self.english_input.text.strip():
            add_history_entry(self.english_input.text, self.aurebesh_input.text)
        popup = HistoryPopup(translator_widget=self)
        popup.open()

    def open_settings(self):
        popup = SettingsPopup(translator_widget=self)
        popup.open()

    def open_learning(self):
        popup = GameSelectionPopup(translator_widget=self)
        popup.open()

    def open_flashcards(self):
        if len(self.unlocked_tiers) > 1:
            popup = TierSelectPopup(translator_widget=self, tiers=sorted(self.unlocked_tiers))
        else:
            popup = FlashCardPopup(translator_widget=self)
        popup.open()

    def open_word_search(self):
        print("🔍 open_word_search() called")
        words = ["MAY", "THE", "FORCE", "BE", "WITH", "YOU"]
        WordSearchPopup(words=words, grid_size=12).open()

        # Just open the popup; it builds its own layout now
        words = ["MAY", "THE", "FORCE", "BE", "WITH", "YOU"]
        WordSearchPopup(words=words, grid_size=12).open()

    def apply_theme(self):
        # Grab the freshly-selected colors
        cs = self.colors
        # Update the window background
        Window.clearcolor = cs["bg"]
        # Update both text inputs
        self.english_input.background_color = cs["container"]
        self.english_input.foreground_color = cs["input_text"]
        self.aurebesh_input.background_color = cs["container"]
        self.aurebesh_input.foreground_color = cs["input_text"]
        # Update your gear button
        self.gear_btn.normal_color = cs["icon_normal"]
        self.gear_btn.active_color = cs["icon_active"]
        self.gear_btn.background_color = cs["icon_normal"]
        # update Learn/Game button
        self.learn_btn.normal_color = cs["icon_normal"]
        self.learn_btn.active_color = cs["icon_active"]
        self.learn_btn.background_color = cs["icon_normal"]
        # Update the icon row buttons
        for btn in self.bottom_bar.children:
            btn.normal_color = cs["icon_normal"]
            btn.active_color = cs["icon_active"]
            btn.background_color = cs["icon_normal"]
# -----------------------------
# Custom Keyboard
# -----------------------------

class CustomKeyboard(GridLayout):
    def __init__(self, input_target, translator=None, **kwargs):
        super().__init__(**kwargs)
        self.cols = 1                 # one row per BoxLayout
        self.spacing = dp(4)
        self.input_target = input_target
        self.translator = translator
        self.build_keyboard()

    def build_keyboard(self):
        rows = [
            list("QWERTYUIOP"),
            list("ASDFGHJKL"),
            list("ZXCVBNM"),
            ["SPACE", "BACK", "ENTER"],
            ["CH", "SH", "TH", "NG", "AE", "EO", "KH", "OO"],
        ]
        ligature_map = {
            "CH": "\ue011", "SH": "\ue016", "TH": "\ue018", "NG": "\ue014",
            "AE": "\ue010", "EO": "\ue012", "KH": "\ue013", "OO": "\ue015"
        }

        for row in rows:
            row_layout = BoxLayout(
                orientation="horizontal",
                size_hint_y=None,
                height=dp(48),
                spacing=dp(4),
            )
            for key in row:
                btn = Button(
                    text=key,
                    font_size=dp(18),
                    font_name="Aurebesh-ImpRemnant.otf",
                    background_color=(0, 0, 0, 0.7),
                    color=(1, 0.631, 0.129, 1),
                    size_hint=(1, 1),
                )
                btn.bind(on_release=self.on_key_press)
                btn.key_value = ligature_map.get(key, key.upper())
                row_layout.add_widget(btn)
            self.add_widget(row_layout)

    def on_key_press(self, button):
        key = button.key_value
        input_box = self.input_target
        text = input_box.text
        cursor = input_box.cursor_index()

        # 1) Merge last char + new char into a ligature if possible
        if len(key) == 1 and key.isalpha() and text:
            duo = (text[-1] + key).lower()
            if duo in ligatures:
                glyph = ligatures[duo]
                input_box.text = text[:-1] + glyph
                input_box.cursor = (len(input_box.text), 0)
                if self.translator:
                    self.translator.on_aurebesh_text(input_box, input_box.text)
                return

        # 2) Handle SPACE, BACK, ENTER
        if key == "SPACE":
            key = " "
        elif key == "BACK":
            if cursor > 0:
                input_box.text = text[:cursor-1] + text[cursor:]
                input_box.cursor = (cursor-1, 0)
            return
        elif key == "ENTER":
            key = "\n"

        # 3) Normal insert
        input_box.text = text[:cursor] + key + text[cursor:]
        new_index = cursor + len(key)
        input_box.cursor = input_box.get_cursor_from_index(new_index)

        # 4) Trigger English translation
        if self.translator:
            self.translator.on_aurebesh_text(input_box, input_box.text)

# -----------------------------
# The Kivy App
# -----------------------------
class AurebeshTranslatorApp(App):
    def build(self):
        return TranslatorWidget()

if __name__ == '__main__':
    AurebeshTranslatorApp().run()
