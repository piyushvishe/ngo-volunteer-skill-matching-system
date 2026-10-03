package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Ngo;
import com.ngovolunteer.matching.repository.NgoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class NgoController {

    private final NgoRepository ngoRepository;

    public NgoController(NgoRepository ngoRepository) {
        this.ngoRepository = ngoRepository;
    }

    @PostMapping("/ngo")
    public Ngo createNgo(@RequestBody Ngo ngo) {
        return ngoRepository.save(ngo);
    }

    @GetMapping("/ngos")
    public List<Ngo> getNgos() {
        return ngoRepository.findAll();
    }
}