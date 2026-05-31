<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\ProfanityFilter;

class ProfanityFilterTest extends TestCase
{
    /**
     * Test the ProfanityFilter service directly.
     */
    public function test_profanity_filter_detects_bad_words()
    {
        $this->assertTrue(ProfanityFilter::hasProfanity("C'est de la merde"));
        $this->assertTrue(ProfanityFilter::hasProfanity("Quel connard"));
        $this->assertTrue(ProfanityFilter::hasProfanity("What a bitch"));
        $this->assertTrue(ProfanityFilter::hasProfanity("Tu es un imbécile"));
        $this->assertTrue(ProfanityFilter::hasProfanity("Quel imbecile"));
        
        $this->assertFalse(ProfanityFilter::hasProfanity("Bonjour tout le monde"));
        $this->assertFalse(ProfanityFilter::hasProfanity("Je veux participer à la constitution"));
        $this->assertFalse(ProfanityFilter::hasProfanity("Je risque de perdre mes clés"));
    }
}
