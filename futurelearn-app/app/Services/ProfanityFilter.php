<?php

namespace App\Services;

class ProfanityFilter
{
    /**
     * List of blocked words (profanities) in French and English.
     */
    protected static $badWords = [
        // French
        'merde', 'merdes', 'putain', 'putains', 'connard', 'connards', 'connasse', 'connasses',
        'salope', 'salopes', 'salopard', 'salopards', 'enculé', 'enculés', 'encule', 'encules',
        'enculer', 'batard', 'batards', 'bâtard', 'bâtards', 'fdp', 'fils de pute', 'fils de putes',
        'chier', 'chiant', 'chiante', 'chiants', 'chiantes', 'couille', 'couilles', 'bordel',
        'salaud', 'salauds', 'niquer', 'nique', 'niques', 'niquez', 'niquera', 'niqueront',
        'viol', 'violer', 'pd', 'pédé', 'pédés', 'bite', 'bites', 'chatte', 'chattes', 'cul', 'culs',
        'foutre', 'tarlouze', 'tarlouzes', 'mongol', 'mongole', 'mongols', 'crever', 'crève',
        'abruti', 'abrutis', 'imbecile', 'imbeciles', 'imbécile', 'imbéciles',

        // English
        'fuck', 'fucking', 'fucker', 'fuckers', 'fucks', 'shit', 'shits', 'shitty',
        'bitch', 'bitches', 'asshole', 'assholes', 'bastard', 'bastards', 'cunt', 'cunts',
        'dick', 'dicks', 'pussy', 'cock', 'retard', 'whore', 'slut', 'sluts'
    ];

    /**
     * List of short or ambiguous words that must match strictly as whole words.
     */
    protected static $strictWords = [
        'con', 'cons'
    ];

    /**
     * Check if the text contains any bad words.
     *
     * @param string $text
     * @return bool
     */
    public static function hasProfanity(string $text): bool
    {
        if (empty(trim($text))) {
            return false;
        }

        // Normalize text: lowercase
        $normalizedText = mb_strtolower($text, 'UTF-8');

        // Regex boundary pattern that supports French accents
        // Avoids matching bad words embedded inside correct words (e.g. "constituer" containing "con")
        $boundaryLeft = '(?<![a-zA-Z0-9àâäéèêëîïôöùûüç])';
        $boundaryRight = '(?![a-zA-Z0-9àâäéèêëîïôöùûüç])';

        foreach (self::$badWords as $word) {
            $quoted = preg_quote($word, '/');
            $pattern = '/' . $boundaryLeft . $quoted . $boundaryRight . '/ui';
            if (preg_match($pattern, $normalizedText)) {
                return true;
            }
        }

        foreach (self::$strictWords as $word) {
            $quoted = preg_quote($word, '/');
            $pattern = '/' . $boundaryLeft . $quoted . $boundaryRight . '/ui';
            if (preg_match($pattern, $normalizedText)) {
                return true;
            }
        }

        return false;
    }
}
