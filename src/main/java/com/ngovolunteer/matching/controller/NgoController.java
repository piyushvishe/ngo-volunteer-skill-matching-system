package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Ngo;
import com.ngovolunteer.matching.service.NgoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ngos")
public class NgoController {

    private final NgoService ngoService;

    public NgoController(NgoService ngoService) {
        this.ngoService = ngoService;
    }

    @PostMapping
    public Ngo createNgo(@RequestBody Ngo ngo) {
        return ngoService.createNgo(ngo);
    }

    @GetMapping
    public List<Ngo> getAllNgos() {
        return ngoService.getAllNgos();
    }

    @GetMapping("/{id}")
    public Ngo getNgoById(@PathVariable Long id) {
        return ngoService.getNgoById(id);
    }

    @PutMapping("/{id}")
    public Ngo updateNgo(@PathVariable Long id, @RequestBody Ngo ngo) {
        return ngoService.updateNgo(id, ngo);
    }

    @DeleteMapping("/{id}")
    public void deleteNgo(@PathVariable Long id) {
        ngoService.deleteNgo(id);
    }
}